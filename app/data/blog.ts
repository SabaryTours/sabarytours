export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  image: string;
  views: number;
  comments: number;
  author: string;
  date: string;
  content: string;
  excerpt?: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "The Need for Guided Tours",
    slug: "the-need-for-guided-tours",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop",
    views: 461,
    comments: 1,
    author: "Laila A. Rahman",
    date: "Nov 2023",
    content: `Guided tours offer an unparalleled way to explore new destinations, providing travelers with expert knowledge, local insights, and a structured experience that maximizes both learning and enjoyment. Whether you're visiting historical sites, natural wonders, or cultural landmarks, a knowledgeable guide can transform a simple visit into a memorable journey of discovery.

One of the primary advantages of guided tours is the depth of information they provide. Professional guides are trained to share not just facts, but stories, context, and hidden details that you might miss on your own. They can answer questions, point out interesting features, and help you understand the significance of what you're seeing.

Safety and convenience are also significant benefits. Guides know the terrain, understand local customs, and can help navigate language barriers. They handle logistics, timing, and can adapt to unexpected situations, allowing you to relax and fully immerse yourself in the experience.

For those interested in Ghana's rich history and culture, guided tours are particularly valuable. From the historic castles along the coast to the vibrant markets of Accra, a guide can help you understand the layers of history, culture, and meaning that make each location special.`,
    excerpt: "Discover why guided tours offer the best way to explore new destinations with expert knowledge and local insights."
  },
  {
    id: "2",
    title: "The 13th edition of Chale Wote Festival",
    slug: "the-13th-edition-of-chale-wote-festival",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop",
    views: 461,
    comments: 2,
    author: "Laila A. Rahman",
    date: "Nov 2023",
    content: `The Chale Wote Street Art Festival is an annual street carnival that celebrates Ghanaian art and culture. Established in 2011, this vibrant event has grown into one of the most anticipated cultural festivals in Accra, bringing together artists, performers, and visitors from around the world.

The 13th edition marked a significant milestone as the festival relocated from its traditional home in Jamestown to the Osu community at Independence Square. This move was necessitated by the festival's growing popularity and the need for more space to accommodate the expanding program of activities.

The name "Chalewote" means "friend, let's go" in the Ga language, perfectly capturing the festival's spirit of community, celebration, and artistic expression. The 2023 edition spanned seven exciting days from August 17th to 24th, offering an incredible array of activities and experiences.

Festival highlights included photo exhibitions showcasing local and international talent, street painting and graffiti murals that transformed public spaces into canvases, theatre performances, spoken word sessions, skate shows, and a vibrant food and fashion marketplace. The African Cinema pavilion featured screenings of films from across the continent, while design labs and recyclable design workshops encouraged hands-on participation.

One of the unique features of the 2023 festival was the emphasis on interactive experiences. Visitors had the opportunity to participate in workshops, learn new skills, and engage directly with artists and performers. This participatory approach made the festival more than just a spectator event—it became a collaborative celebration of creativity.

Notable attendees included Grammy-nominated musician Rocky Dawuni, former Deputy Minister Zenator Rawlings, traditional leader King Ayisobo, and legendary musician Amandzeba, adding to the festival's prestige and cultural significance.

The Chale Wote Festival continues to be a testament to Ghana's vibrant arts scene and its ability to bring communities together through creativity and celebration.`,
    excerpt: "Celebrating Ghanaian art and culture at the vibrant Chale Wote Street Art Festival in Accra."
  },
  {
    id: "3",
    title: "Quad Bike Destinations in Ghana",
    slug: "quad-bike-destinations-in-ghana",
    image: "https://images.unsplash.com/photo-1558980663-3685c1d673c4?w=800&h=600&fit=crop",
    views: 461,
    comments: 1,
    author: "Laila A. Rahman",
    date: "Nov 2023",
    content: `Ghana offers some of the most exciting quad biking experiences in West Africa, with diverse terrains that range from coastal dunes to mountainous landscapes. Whether you're an adrenaline junkie or a nature enthusiast, quad biking provides a unique way to explore Ghana's stunning scenery.

The coastal regions offer sandy trails along beautiful beaches, where you can ride with the ocean breeze in your hair and stunning views of the Atlantic. These routes are perfect for beginners, with relatively flat terrain and plenty of space to build confidence.

For more experienced riders, the mountainous regions provide challenging trails with varying elevations, rocky paths, and breathtaking vistas. These routes take you through forests, past waterfalls, and offer panoramic views of Ghana's diverse landscape.

Safety is paramount, and all reputable operators provide proper safety equipment, briefings, and guided tours. Whether you're looking for a quick adventure or a full-day exploration, quad biking in Ghana offers an unforgettable way to experience the country's natural beauty.`,
    excerpt: "Explore Ghana's diverse landscapes on an exciting quad biking adventure."
  },
//   {
//     id: "4",
//     title: "Top Art Galleries in Ghana You Must Visit",
//     slug: "top-art-galleries-in-ghana-you-must-visit",
//     image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
//     views: 461,
//     comments: 1,
//     author: "Laila A. Rahman",
//     date: "Nov 2023",
//     content: `Ghana's art scene is thriving, with numerous galleries showcasing both traditional and contemporary works. From established institutions to emerging spaces, these galleries offer visitors a chance to explore the rich artistic heritage and modern creativity of Ghana.

// Gallery 1957, located in Accra, is one of the most prominent contemporary art spaces, featuring works by both established and emerging Ghanaian artists. The gallery regularly hosts exhibitions, artist talks, and cultural events that bring the art community together.

// The National Museum of Ghana houses an extensive collection of traditional art, artifacts, and historical pieces that tell the story of Ghana's cultural heritage. It's an essential visit for anyone interested in understanding the country's artistic traditions.

// Other notable galleries include the Artists Alliance Gallery, which showcases a diverse range of contemporary works, and the Nubuke Foundation, which focuses on promoting Ghanaian and African art through exhibitions and educational programs.

// Visiting these galleries provides insight into Ghana's artistic evolution, from traditional forms to cutting-edge contemporary expressions.`,
//     excerpt: "Discover the vibrant art scene in Ghana through its top galleries and cultural spaces."
//   },
//   {
//     id: "5",
//     title: "Escaping City Pressure",
//     slug: "escaping-city-pressure",
//     image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
//     views: 461,
//     comments: 1,
//     author: "Laila A. Rahman",
//     date: "Nov 2023",
//     content: `In today's fast-paced world, finding moments of peace and relaxation is essential for mental and physical well-being. Ghana offers numerous opportunities to escape the pressures of city life and reconnect with nature, culture, and yourself.

// From serene beach resorts along the coast to peaceful retreats in the mountains, Ghana provides the perfect setting for relaxation and rejuvenation. Whether you're looking for a weekend getaway or an extended stay, there are options to suit every preference and budget.

// The country's natural beauty, warm hospitality, and rich cultural experiences make it an ideal destination for those seeking to unwind and recharge.`,
//     excerpt: "Find peace and relaxation in Ghana's serene natural settings and cultural retreats."
//   },
];

export interface Comment {
  id: string;
  author: string;
  date: string;
  content: string;
  avatar?: string;
}

export const comments: Record<string, Comment[]> = {
  "the-13th-edition-of-chale-wote-festival": [
    {
      id: "1",
      author: "Adjoa Maison",
      date: "Nov 2023",
      content: "I can't wait to experience it next year!",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    {
      id: "2",
      author: "Frimpong Agyei",
      date: "Nov 2023",
      content: "This was gold!",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
  ],
};

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getRelatedPosts(currentSlug: string, limit: number = 3): BlogPost[] {
  return blogPosts.filter((post) => post.slug !== currentSlug).slice(0, limit);
}


