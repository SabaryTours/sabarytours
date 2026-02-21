import fs from 'fs';
import path from 'path';
import iconv from 'iconv-lite';
import striptags from 'striptags';

// Configuration
const SQL_FILE_PATH = path.join(process.cwd(), 'sabarytours', 'sabarytour.sql');
const OUTPUT_DIR = path.join(process.cwd(), 'migration_output');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

// Helper to fix mojibake (latin1 -> utf8)
const fixEncoding = (str: string): string => {
  try {
    // The data was likely UTF-8 bytes interpreted as Windows-1252 (CP1252).
    // So we encode it back to Win1252 binary, then decode as UTF-8.
    const buffer = iconv.encode(str, 'win1252');
    return iconv.decode(buffer, 'utf-8');
  } catch (e) {
    console.error('Encoding error:', e);
    return str;
  }
};

// Helper to split string by comma respecting quotes and parens
const splitValues = (str: string): string[] => {
  const values = [];
  let currentVal = '';
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let escape = false;
  let pDepth = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    if (escape) {
      currentVal += char;
      escape = false;
      continue;
    }
    if (char === '\\') {
      currentVal += char;
      escape = true;
      continue;
    }

    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      currentVal += char;
    } else if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      currentVal += char;
    } else if (char === '(' && !inSingleQuote && !inDoubleQuote) {
      pDepth++;
      currentVal += char;
    } else if (char === ')' && !inSingleQuote && !inDoubleQuote) {
      pDepth--;
      currentVal += char;
    } else if (char === ',' && pDepth === 0 && !inSingleQuote && !inDoubleQuote) {
      values.push(currentVal.trim());
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  if (currentVal.trim()) {
    values.push(currentVal.trim());
  }
  return values;
};

// Helper to parse SQL INSERT statements (Robust State Machine)
const parseInsertStatements = (sqlContent: string, tableName: string): any[] => {
  const marker = `INSERT INTO \`${tableName}\``;
  const matches = [];
  let currentIndex = 0;

  while (true) {
    const insertStart = sqlContent.indexOf(marker, currentIndex);
    if (insertStart === -1) break;

    // Find the 'VALUES' keyword after the marker
    const valuesStart = sqlContent.indexOf('VALUES', insertStart);
    if (valuesStart === -1) break; // Should not happen in valid SQL

    // Extract columns between marker and VALUES
    const columnsString = sqlContent.substring(insertStart + marker.length, valuesStart).trim();
    // columnsString looks like "(`col1`, `col2`)"
    const columns = columnsString.replace(/^\(|\)$/g, '').split(',').map(c => c.trim().replace(/`/g, ''));

    // Now parse values until the terminating semicolon
    // We need to handle quotes (' and ") and escapes (\) to ignore semicolons inside strings
    let valueBlockEnd = -1;
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let escape = false;

    // Start scanning from after 'VALUES'
    // Usually there is a space or newline
    let scanIndex = valuesStart + 6;

    for (let i = scanIndex; i < sqlContent.length; i++) {
      const char = sqlContent[i];

      if (escape) {
        escape = false;
        continue;
      }

      if (char === '\\') {
        escape = true;
        continue;
      }

      if (char === "'" && !inDoubleQuote) {
        inSingleQuote = !inSingleQuote;
      } else if (char === '"' && !inSingleQuote) {
        inDoubleQuote = !inDoubleQuote;
      } else if (char === ';' && !inSingleQuote && !inDoubleQuote) {
        // Found the semicolon ending the statement
        valueBlockEnd = i;
        break;
      }
    }

    if (valueBlockEnd === -1) {
      // Did not find semicolon? syntax error or end of file
      break;
    }

    const valuesBlock = sqlContent.substring(scanIndex, valueBlockEnd).trim();

    // Again, we must use a state machine to split by comma ONLY if not in quotes and not in parentheses (groups)

    // Actually, simple split is hard.
    // Let's iterate through valuesBlock

    // Use helper to split rows
    const rows = splitValues(valuesBlock);

    // Now parse each row
    for (let row of rows) {
      // Strip outer parentheses
      row = row.trim();
      if (row.startsWith('(') && row.endsWith(')')) {
        row = row.substring(1, row.length - 1);
      }

      // row is like: 1, 'string', NULL
      // We need to split by comma respecting quotes
      const values = splitValues(row);

      // Clean up values
      const cleanValues = values.map(v => {
        if (v.toUpperCase() === 'NULL') return null;
        if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1).replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        if (v.startsWith('"') && v.endsWith('"')) return v.slice(1, -1).replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        return v;
      });

      const record: any = {};
      columns.forEach((col, idx) => {
        record[col] = cleanValues[idx];
      });
      matches.push(record);
    }

    // Move currentIndex to after this INSERT block to find the next one
    if (valueBlockEnd !== -1) {
      currentIndex = valueBlockEnd + 1;
    } else {
      // Should have been handled above, but just in case
      // Force advance to avoid infinite loop
      currentIndex = valuesStart + 6;
    }
  }
  return matches;
};

const processBlogs = (sqlContent: string) => {
  console.log('Processing Blogs...');
  const blogs = parseInsertStatements(sqlContent, 'blog');
  console.log(`Debug: Found ${blogs.length} raw blog records.`);

  const cleanedBlogs = blogs.map(b => {
    // 1. Fix Encoding
    let title = fixEncoding(b.blog_title || '');
    let content = fixEncoding(b.blog_content || '');

    // 2. Strip HTML for a "summary" or "plain_text" version if needed, 
    // AND clean up the main content if it has weird artifacts
    const cleanContent = content; // Keep HTML for the body
    const summary = striptags(content).substring(0, 150) + '...';

    return {
      title,
      content: cleanContent, // Keep HTML
      summary, // New field
      image_url: b.blog_image,
      created_at: b.blog_date,
      status: b.blog_status === 'published' ? 'published' : 'draft',
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    };
  });

  fs.writeFileSync(path.join(OUTPUT_DIR, 'blogs.json'), JSON.stringify(cleanedBlogs, null, 2));
  console.log(`Saved ${cleanedBlogs.length} blogs.`);
};

const processAnnouncements = (sqlContent: string) => {
  console.log('Processing Announcements...');
  const items = parseInsertStatements(sqlContent, 'anounce');
  const cleaned = items.map(i => ({
    title: fixEncoding(i.an_title || ''),
    content: fixEncoding(i.an_description || ''), // Contains HTML
    type: i.an_type,
    created_at: i.an_date,
    image: i.an_image
  }));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'announcements.json'), JSON.stringify(cleaned, null, 2));
  console.log(`Saved ${cleaned.length} announcements.`);
};

const scanTables = (sqlContent: string) => {
  console.log('Scanning for tables...');
  const tableRegex = /CREATE TABLE IF NOT EXISTS `(\w+)` \(([\s\S]*?)\) ENGINE=/g;
  let match;
  const tables = [];
  while ((match = tableRegex.exec(sqlContent)) !== null) {
    const tableName = match[1];
    const columnsBlock = match[2];
    const columns = columnsBlock.split(',').map(line => {
      const colMatch = line.trim().match(/^`(\w+)`/);
      return colMatch ? colMatch[1] : null;
    }).filter(Boolean);
    tables.push({ tableName, columns });
    console.log(`Found table: ${tableName}`);
    console.log(`Columns: ${columns.join(', ')}`);

    // Check for data
    const insertRegex = new RegExp(`INSERT INTO \`${tableName}\``);
    if (insertRegex.test(sqlContent)) {
      console.log(`- Has data`);
    } else {
      console.log(`- No data found`);
    }
    console.log('---');
  }
};


const processTours = (sqlContent: string) => {
  console.log('Processing Tours (Listings)...');
  const listings = parseInsertStatements(sqlContent, 'listing');
  const images = parseInsertStatements(sqlContent, 'listing_image');
  const prices = parseInsertStatements(sqlContent, 'price');
  const features = parseInsertStatements(sqlContent, 'special_features');
  const itineraries = parseInsertStatements(sqlContent, 'itinerary');

  const tours = listings.map(l => {
    // Basic fields
    const tour = {
      id: l.listing_id, // Keep legacy ID for reference
      token_id: l.listing_token_id,
      title: fixEncoding(l.listing_title),
      location: fixEncoding(l.listing_location),
      description: fixEncoding(l.listing_description), // HTML
      map_url: l.listing_google_map,
      duration: l.listing_duration,
      start_time: l.listing_time,
      currency: l.listing_currency,
      created_at: l.listing_date_created,
      status: l.listing_status,
      category: l.package_id == 1 ? 'group_trips' :
        l.package_id == 3 ? 'tours' :
          l.package_id == 33 ? 'adrenaline' :
            l.package_id == 34 ? 'cruise' :
              l.package_id == 35 ? 'city_tour' : 'other',
      date: l.listing_date, // Specific date?
      images: images.filter(img => img.listing_token_id === l.listing_token_id).map(img => img.listing_image),
      features: features.filter(f => f.listing_token_id === l.listing_token_id).map(f => fixEncoding(f.special_features_title)),
      prices: prices.filter(p => p.listing_token_id === l.listing_token_id).map(p => ({
        name: fixEncoding(p.price_name),
        amount: p.price_amount,
        number: p.price_number // ?
      })),
      itinerary: itineraries.filter(i => i.listing_token_id === l.listing_token_id).map(i => ({
        title: fixEncoding(i.itinerary_title),
        description: fixEncoding(i.itinerary_description)
      }))
    };
    return tour;
  });

  fs.writeFileSync(path.join(OUTPUT_DIR, 'tours.json'), JSON.stringify(tours, null, 2));
  console.log(`Saved ${tours.length} tours (with images, prices, itineraries).`);
};

const processBookings = (sqlContent: string) => {
  console.log('Processing Bookings...');
  const bookings = parseInsertStatements(sqlContent, 'booking');
  const guests = parseInsertStatements(sqlContent, 'tour_people');

  const cleanedBookings = bookings.map(b => {
    const relatedGuests = guests.filter(g => g.booking_invoice_number === b.booking_receipt);
    const numPeople = 1 + relatedGuests.length; // Main booker + guests

    // Attempt to split user_name into first and last
    const fullName = fixEncoding(b.booking_name) || 'Unknown';
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Unknown';

    return {
      legacy_id: parseInt(b.booking_id),
      tour_title: fixEncoding(b.booking_listing_title), // Use to look up tour_id

      first_name: firstName,
      last_name: lastName,
      email: b.booking_email,
      phone: b.booking_phone,

      date: b.booking_tour_date, // Will need validation during seed
      number_of_people: numPeople,

      total_price: parseFloat(b.total_booking_cost) || 0,
      payment_amount: parseFloat(b.amount_paid) || 0,
      payment_option: parseFloat(b.amount_paid) >= parseFloat(b.total_booking_cost) ? 'full' : 'deposit',
      payment_status: b.booking_status === 'done' ? 'paid' : 'pending',
      status: b.booking_status === 'done' ? 'completed' : 'pending',

      created_at: new Date().toISOString()
    };
  });

  fs.writeFileSync(path.join(OUTPUT_DIR, 'bookings.json'), JSON.stringify(cleanedBookings, null, 2));
  console.log(`Saved ${cleanedBookings.length} bookings.`);
};

const processMisc = (sqlContent: string) => {
  console.log('Processing Misc Tables...');

  // Testimonials
  const testimonies = parseInsertStatements(sqlContent, 'testimony').map(t => ({
    name: fixEncoding(t.testimony_name),
    position: fixEncoding(t.testimony_position),
    message: fixEncoding(t.testimony_message),
    image: t.testimony_image,
    date: t.testimony_date
  }));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'testimonials.json'), JSON.stringify(testimonies, null, 2));

  // Partners
  const partners = parseInsertStatements(sqlContent, 'partners').map(p => ({
    name: fixEncoding(p.partner_name),
    image: p.partner_image
  }));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'partners.json'), JSON.stringify(partners, null, 2));

  // Newsletter
  const subscribers = parseInsertStatements(sqlContent, 'newsletter').map(n => ({
    email: n.email_letter,
    date: n.news_date
  }));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'subscribers.json'), JSON.stringify(subscribers, null, 2));

  // Contacts & Inquiries (Consolidated)
  const contacts = parseInsertStatements(sqlContent, 'contact').map(c => ({
    name: fixEncoding(c.contact_name),
    email: c.contact_email,
    subject: fixEncoding(c.contact_subject),
    message: fixEncoding(c.contact_message),
    date: c.contact_date,
    type: 'general'
  }));

  const personalPackages = parseInsertStatements(sqlContent, 'personal_package').map(p => ({
    name: fixEncoding(p.personal_package_name),
    email: p.personal_package_email,
    phone: p.personal_package_phone,
    package_name: p.personal_package_name,
    message: fixEncoding(p.personal_package_added_info),
    date: p.date_sent,
    type: 'personal_package'
  }));

  const allInquiries = [...contacts, ...personalPackages];
  fs.writeFileSync(path.join(OUTPUT_DIR, 'inquiries.json'), JSON.stringify(allInquiries, null, 2));

  console.log('Saved misc tables: testimonials, partners, subscribers, inquiries (consolidated).');
};


const processUsers = (sqlContent: string) => {
  console.log('Processing Users...');
  const users = parseInsertStatements(sqlContent, 'users');
  console.log(`Debug: Found ${users.length} raw user records.`);

  const cleanedUsers = users.map(u => ({
    legacy_id: parseInt(u.user_id),
    email: u.user_email,
    username: fixEncoding(u.username),
    password_hash: u.user_password,
    firstname: fixEncoding(u.user_firstname),
    lastname: fixEncoding(u.user_lastname),
    phone: u.user_phone_number,
    role: u.user_role
  }));

  fs.writeFileSync(path.join(OUTPUT_DIR, 'users.json'), JSON.stringify(cleanedUsers, null, 2));
  console.log(`Saved ${cleanedUsers.length} users.`);
};


// Execute
try {
  const sqlContent = fs.readFileSync(SQL_FILE_PATH, 'utf-8');

  processBlogs(sqlContent);
  processAnnouncements(sqlContent);
  processTours(sqlContent);
  processBookings(sqlContent);
  processMisc(sqlContent);
  processUsers(sqlContent);

  // scanTables(sqlContent); // Uncomment if needed

  console.log('Migration data preparation complete!');
} catch (e) {
  console.error('Failed to read SQL file or process data:', e);
}
