
import re
import uuid
import datetime

# Raw data from the SQL file (lines 1675-1715)
raw_sql_data = """
(1, '6d90b192b337fdf801da37f8e2e4390f20336ce1199515', 'admin@sabarytours.com', 'sabary', '$2y$12$gIeosKKb2TZPb7cWytHBVuomXb55dnd5WCgx/pu5319mJkOgLuszu', 'Sabary', 'Tour', '', 'fav.png', 'active', 'admin', 'b7442d08a29ae21d1e9133a31a0e73144628bc56007e681ee2c798c76131f34a14aae8f65b42c5539a85ee44344b2bdc4c2c', NULL),
(77, '4228b0380dcae503c455d2cdf1c0167a4ccb48339038545', 'kingklan07@hotmail.com', 'allblack', '$2y$12$t4c3QPbcGih40aeBr6oazeOR2Tlm6srtn4o9YpKyOryABSn7DcbIK', 'All black', 'Kankam', '0242252749', NULL, 'active', 'subscriber', '', NULL),
(78, '597d825dc8467ab57dd37942c9624484d32b77e08947216', 'vwhite@saul.com', 'amani_nikolaus', '$2y$12$WoNNYmRzCEj36M7FzMp8aOCpdJShV1apQLvrozXQGzw0KW9kM6K3y', 'Connie', 'Zieme', '17171392063', NULL, 'not verify', 'subscriber', '8ae9247cdd43c6fb5658e9bdc9a7dc9b2c8002daa2af2cd1d88e65138fdcb3eb65a4e701fabeb76b8bb79655f7ac32312a5a', NULL),
(79, 'c8b15583adcdca773606f938e70951bf834a81128172690', 'fjahimaz@comcast.net', 'rey_effertz42', '$2y$12$CNJby4FzvsLUgo8Dlez3rOg.gn0rjwggxG4/bgcaAgvKT5D8D97MO', 'Earl', 'Casper', '10972146996', NULL, 'not verify', 'subscriber', '66a3f6d469ac7933f4630fded295c022e10a16e4e6e5730128982072b8f34053ae044420d8ecba0ea8b5ea4b7d7d865d2663', NULL),
(80, '19c42381e2857cb6126974226b31cbba8547b8731888242', 'rameshdaya27@gmail.com', 'emmanuel.ernser46', '$2y$12$QWINMXjst.BuBNp1FnLbz.SQwPPnEQOxveBrjs4qdiQj.b3mthsuC', 'Amani', 'Windler', '19948472483', NULL, 'not verify', 'subscriber', 'e0e7ec4df428f0bb49e828700ad06396af8ce0718dc4746003d182d626511d45031328a4ddd5014e4fc2ca51c67819936c57', NULL),
(81, '3ba7782ccd729fb9a021ac8e0628e9cba20e45585268066', 'lailasabary@gmail.com', 'theawkwardtraveller', '$2y$12$7/Be1DxeEjEL70EKj1MMyOHKo7e7P8J4bODTXxUEeN5Pu/VVbrc9G', 'Laila', 'Abdul Rahman', '+233543093838', NULL, 'active', 'subscriber', '', NULL),
(82, '0a309673f4af0e5d92411241b052d5ea961a8ef72581651', 'mcmurray676@btinternet.com', 'kelsi81', '$2y$12$1nPUW0iK6PV29T5d/tBPheeQAvRnb/qul9SfNBtFtaDxQ5Q/KGBT2', 'Consuelo', 'Schaden', '12123617946', NULL, 'not verify', 'subscriber', '2d8f0c5a7e6bc1a85f4f4af530623213a230fc41e8c5c097c40639fcc08014c71da16c34cfc36e09b63662e0ee0c0746c6f5', NULL),
(84, 'b8e909277b69f26e256a1b912856263127c214a27308486', 'razakhaniffa6@yahoo.com', 'pometa12345', '$2y$12$pkI6wieQ3uPeAm6Jbnyu1OQ1WmBd8NFamhmjWWS6N0arElYZpzidO', 'Haniffa', 'Razak', '3897646844', NULL, 'active', 'subscriber', '', NULL),
(85, '4038819d9302f89e47f6d185abb7c2f07e38c20b1691530', 'razaksherifa2@libero.it', 'sherifarazak', '$2y$12$76o0UAn1KOh6GM8xe5A1AO4wn0xzWSPSBLWaop7zuLbnr2iQnCquO', 'Sherifa', 'Razak', '3714384326', NULL, 'active', 'subscriber', '', NULL),
(95, 'baccf0c8d1b956ec0ddf51ee34b9fe42ec1b42151466731', 'abdulrahmanjalila@yahoo.it', 'abdul rahman', '$2y$12$93UVGXrOBEHWLgaJSXHy8ewdLywjM2DXV1GKmH7vI6P4sJfmMmbg6', 'Jalila', 'Abdul Rahman', '00393278642284', NULL, 'active', 'subscriber', '', NULL),
(96, 'fe32710263e755a27c63582624c5a237c8ea66fe62025', 'ladyhive@gmail.com', 'lady julia', '$2y$12$f64TspdwAqTH45syAgdeE.6Y7rbyAFesqN6Yj6DFNGa5p8gnFl3IC', 'Lady Julia', 'Asamany', '0209059446', NULL, 'active', 'subscriber', '', NULL),
(99, '1f4253d48c6081e2a9fc07172c1b798ef4b91ba942264', 'contact.djoks@gmail.com', 'philip', '$2y$12$vEyacVcWf4PXc4woEroR7O.5EZKDzkGGMyAwxkTBUx2kkAuq3XAjq', 'Philip', 'Djokoto', '+233544009412', NULL, 'active', 'subscriber', '', NULL),
(100, '77c35f8e0ecc3394b3157cdbceb080b50286ff80583078', 'claudiamenie@gmail.com', 'claudia', '$2y$12$hMBUZKuaha/RqAIZe6hw1unSRPj0WrF.n6bgYnWWibSpUAdm4PILC', 'Claudia', 'Mintogo', '0269384159', NULL, 'active', 'subscriber', '2e3ade51436ccf5c94689bee42d06812c5cc4abf93d9e92f41ab09b5d2b3391a54ae5a15e9be543787f967a2e631240c9c4e', NULL),
(101, 'fb7495fc685244da0921e3e8b846496038ac4afd8857098', 'esijossey@gmail.com', 'jossey', '$2y$12$kPTMgXY10jenouz/xhjZtuvjMbWe2McUh8.mhHRTjKHca3WOP1r16', 'Josephine', 'Ahose', '0553005775', NULL, 'active', 'subscriber', '', NULL),
(103, '7bdd7dcbd167467bb35e108e0f07b2cb286610758762553', 'afiakaley@outlook.com', 'engracia', '$2y$12$u72r7eTHMdNx/DE7kVTBHeGtnD5qd6PkcGDYtiqH87fkrrbfiwjKC', 'Engracia', 'Mofuman', '+233245223992', NULL, 'active', 'subscriber', '', NULL),
(104, '090cd0b575d7ed8035406f9fb79900846d8ed58a6741165', 'ehikhamenorkingsley71@gmail.com', 'lordking', '$2y$12$PvmrDjNKfLOC7tDshGE3LefF0GK9pHNS.WOu5NofYlhw5efhVG3Ka', 'Ehikhamenor', 'Kingsley', '+233550650979', NULL, 'active', 'subscriber', '', NULL),
(105, 'c967f91413e803ab11cd9a456483cbdf33df23454523975', 'nialhassan9020@gmail.com', 'tunteya', '$2y$12$hPOqXiW9HNDdfY4HIh3zfOdolEHMDYlmkgCHJTx0lvUwbrSjPtVLm', 'Nihaad', 'Alhassan', '+233592577804', NULL, 'active', 'subscriber', '', NULL),
(106, 'a69311e29d0366ff86104ca953fd97db8b20a6ba9698453', 'sharifazanti@gmail.com', 'sharifhg', '$2y$12$Jm7MziXjSjxxfA44N5EyVO2k7triyb4CcUyqTdExv0R5UncxmU6O.', 'Sharif', 'Azanti', '0542118854', NULL, 'active', 'subscriber', '', NULL),
(108, 'd8a3c3dde09efca8a26b2a1c9c306ed19955790e8624662', 'ahlamsaani@gmail.com', 'teiyarh_24', '$2y$12$Yv4epM3KkRkQsUO70uhR..DhlOROXfTtb9oZibPC0e.9taE6kcB2m', 'Ahlam', 'Saani', '+233247744523', NULL, 'active', 'subscriber', '', NULL),
(109, '756b2cf63bf10b87d3ad537337c158ae1deaefaf4537070', 'emerald2adjei@gmail.com', 'enyaadjei', '$2y$12$EKGkJa4dBWHKTqwl8RkuwuitOnkVY58LwTLl9aaE9FDDqZeX1h7Ay', 'Emerald', 'Adjei', '+233240428787', NULL, 'active', 'subscriber', '', NULL),
(110, '065b48ac28f965e4dda4fe208dd74db6c34ffb39739190', 'taphyann@gmail.com', 'fafali', '$2y$12$oHHa7a01fOqUp/e0EYoTwe91d905BRPefrNFqAOlplZSDR6Xfnw32', 'Fafali', 'Tudzi', '0202009483', NULL, 'active', 'subscriber', '', NULL),
(111, '88a6579a35dc627fb16322715c6217e3f931572d6596176', 'gedmond3@gmail.com', 'kwesi07', '$2y$12$Xmc5iAN3WouycDcnPheFVOwOpJhy.qHHZKF/ZXprMi/yxk/XwIWfm', 'Edmond', 'Kwesi', '0501216793', NULL, 'active', 'subscriber', '', NULL),
(112, '9eebf2efa469aa6175de40fef997fedc5e8c9f115746217', 'ddesireej77@gmail.com', 'ddjones', '$2y$12$tGv11vtCbTvUg7BndJYQdeKunQjZtZaU426G2IZh/Sm.n0ggexyrK', 'Danielle', 'Jones', '0506409069', NULL, 'active', 'subscriber', '', NULL),
(466, 'c951863d588821e67c5f40d0dbe1f87eab39e3fe912083', 'vdames@aol.com', 'vdames', '$2y$12$xmVK1s8Ia0G9QbieLHJv3.ooJ/sjZvq4ogjTKHUMWiZYP9tP/G4Kq', 'Valerie', 'Dames', '9514015753', NULL, 'active', 'subscriber', '', NULL),
(467, 'fc60b4044fc82ae95226283133205480f80e5ac48791246', 'eamuah1@gmail.com', 'kukuubey', '$2y$12$nnnHee.7MBwiBMjJNAWgC.9zmjGq8bPiIrpciHoEwT5j9yAidqUNy', 'Ekua Amoaba', 'Amuah', '0548058570', NULL, 'active', 'subscriber', '', NULL),
(468, 'd80dde32643f55dff7b5ae7b1bdc86e21749381c7704484', 'info@vickieremoe.com', 'akarababe', '$2y$12$W7qpGh3NOqI2io/ybdG7sO9dMUaS83XbRgj1CP2W3rEE1Go.VtfM2', 'Vickie', 'Remoe', '+233 26 984 2756', NULL, 'active', 'subscriber', '', NULL),
(469, '492142ae50b986c75ae6d970a6248189cbc881896065193', 'mariaahmed293@gmail.com', 'mariah', '$2y$12$teLfsoaa5jGdYM.oDllMQOPtShScMqzTqgb9f3NR/pQBHTbCZgjT2', 'Maria', 'Ahmed', '233242930086', NULL, 'active', 'subscriber', 'b3063c86c98649227f114e4f92c3f0fba87fa487c8b30768659261b09abe07a30b5862c331a560e68146bd03d51b59d53d60', NULL),
(470, 'b076d2cc6b355125fb06deec937a9cdeeafbba5f4183950', 'klassickelvido@gmail.com', 'kelvin3015', '$2y$12$lRaZcLwkDeZ7UkatM2yOV.I9YUzV9f4iJqM9J3dgKaKH4.MTVkmzu', 'Kelvin', 'Ugiagbe', '0558552338', NULL, 'not verify', 'subscriber', '83fb05f8133c8426768fe6095abffb7c79aa8ffe7107def5f8478e8a98e22117d9c57c1c929f16622fb2533afdfca3ba2901', NULL),
(471, '068bd650af882ee26edce51289be2e17d68b01892776273', 'alfred.adusei@yahoo.com', 'alfred', '$2y$12$bzOKCNN/16aHfge3R0UiKObEehnEgKtuh/IlyWgcK5eDDh2Y9XCDm', 'ALFRED', 'ADUSEI', '+233265426874', NULL, 'active', 'subscriber', '', NULL),
(472, 'c0e700e1c1d4cb15661bd9020fae6bd4d19843a1203139', 'd.aryee150@gmail.com', 'dany_earl', '$2y$12$6fvdGM5aWZPhyJT30Pnx2.w8HWtNCBlH9Idl9dj7T06Jf9dH02nhy', 'Daniel', 'Aryee', '0241559606', NULL, 'active', 'subscriber', '', NULL),
(473, '4c6bb13a875cd1c3e65666a97e0d0853715ae5311477185', 'kojopanpana@gmail.com', 'panpana', '$2y$12$9pZ71DcdcpWeAbCQriZggOSvaZ9JnE6AJOZUNSGLiJsv6V7XHX5Ye', 'Kojo', 'Panpana', '+233246792209', NULL, 'active', 'subscriber', '', NULL),
(474, '27d8c06f5a5d6f695be41e075a685010b6c77a7b7202467', 'douglassdavis50@gmail.com', 'douglassdavis', '$2y$12$2UGPq.yrzEjQdsnEY9toEO2AYo/oHipCqiUQuygvtSpJAghRok8gu', 'Douglass', 'Davis', '+19192641726', NULL, 'active', 'subscriber', '', NULL),
(475, '6e78ceea2ad85c63dc32f059eddfe45634f1bce8492524', 'ephyanessa@gmail.com', 'ephyanessa', '$2y$12$PZjZwDlWP2pGvu5XxZ8uwe1MO/vGZiyUYpqhkXBm5bsPFeltlZvD2', 'Vanessa', 'Otchere', '+233273430538', NULL, 'active', 'subscriber', '', NULL),
(476, 'd88109df2312c3c3db8f0243d1dc2d2ed70a56ee4313367', 'kughanny21@gmail.com', 'kughanny21@gmail.com', '$2y$12$VcPQGhxu5zE5aAIseYTHI.EIWQg2RESSb5lTogglP.jPUtV1H/Bh6', 'Hannah', 'Nyande', '0591968706', NULL, 'active', 'subscriber', '', NULL),
(477, 'c6a41c9dc1bbb91d175fa3c367a016317b8cc9943921500', 'slichy_sue@yahoo.com', 'slichy', '$2y$12$RA48spQ/asqK8xJlzH807u8LeSZVl177tNsN.fDfGXP4CpwSHDaWO', 'Sue', 'Buachie', '0548331950', NULL, 'active', 'subscriber', '', NULL),
(478, '9d89253c45a86590910a0d72e5f4fc9ed143e9605064958', 'adwoa.akomeah@gmail.com', 'benewaa', '$2y$12$ofhhMT30V/dWwXXYWQFZYeS8O1.yZmKja6jc.ZcqOcJC3AUL060Ma', 'Adwoa', 'Akomea', '233270948500', NULL, 'active', 'subscriber', '', NULL),
(479, '23a8a2e847768e86cdb500ec850b59d7e02729724729686', 'messamsn@gmail.com', 'messan', '$2y$12$7A8yFl/.nnknAnF/eg40be66ffvhzhZxBwU4HNLyJbZ1C4DctbPUm', 'Mawule', 'Messan', '0242397102', NULL, 'not verify', 'subscriber', '451da314ff26aa0732728e378e73028c09bfc1b9c0995a233703756323df5bba2e4aba06391bc49852a0344c7c7937fb8200', NULL),
(480, '381e1b8bf590445fefaa2e031c9c5fbbd4e2794e6414886', 'slazengerschnist@gmail.com', 'bwoy nuru', '$2y$12$2t/aJxjniTeCvMCKNAzOTOFJ7mTMnGx94XQRhkM.S0D3KwANlSuju', 'Muhammad Nurudeen', 'Salisu', '0554273690', NULL, 'active', 'subscriber', '', '2022-07-11 19:20:20'),
(483, '300e48b45254a3b1aa45a14c58ed38436ba316b35397258', 'p.o.yirenkyi@gmail.com', 'pwillis7', '$2y$12$r6xrNkKC6TFC1c9R8/TQhOmYiy1mZHO0qrFNfGHMGiPJ1TahEGe9y', 'Philip', 'Yirenkyi', '0503478398', NULL, 'active', 'subscriber', '', '2024-01-23 23:56:36'),
(484, '09c5c2545134b5721107e5085e10316039c9e09e9478204', 'mahamahamida@gmail.com', 'hamida', '$2y$12$jH7EeRNOF1mW8G5k8Wn3FO1qMJvKMP0x5hIgMsimlXMDtCB.6g.Xa', 'Hamida', 'Mahama', '+233548243018', NULL, 'active', 'subscriber', '', '2025-05-03 20:52:08'),
(488, '91829adf5f4d0c30a990206006e115f9460368a6829783', 'mahamahamida1554@gmail.com', 'meedah47', '$2y$12$uUyGbnrqMP0mrALTpGH15eHcbZwFG7qhglJasQKAcabnw.HAnynCu', 'Hamida', 'Mahama', '+233548243018', NULL, 'active', 'subscriber', '', '2025-06-14 17:43:47')
"""

# Helper to escape single quotes for SQL
def escape_sql(val):
    if val is None:
        return "NULL"
    return str(val).replace("'", "''")

def get_sql_value(val):
  if val == "NULL":
    return "NULL"
  return f"'{escape_sql(val)}'"

lines = raw_sql_data.strip().split('\n')
parsed_users = []

for line in lines:
    # Basic regex to extract values inside parentheses
    # Note: SQL strings can contain commas, so simple split won't work perfectly if strings contain commas.
    # But looking at data, strings are simple. Python eval is safer for tuple parsing if format matches.
    # Clean up line trailing comma
    line = line.strip().rstrip(',')
    if not line: continue
    
    # Simple manual parsing or regex tailored to this specific format if eval fails
    # Format: (id, session, email, username, pass, first, last, phone, image, status, role, token, date)
    # Be careful with NULL
    line = line.replace('NULL', 'None')
    try:
        user_tuple = eval(line)
        parsed_users.append(user_tuple)
    except Exception as e:
        print(f"Error parsing line: {line} - {e}")

# SQL Script Headers
sql_script = """
-- Migration Script for Users
-- Generated by Antigravity

-- 1. Create public.profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  username TEXT,
  phone_number TEXT,
  role TEXT DEFAULT 'subscriber',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies (Open for now, lock down later)
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 4. Import Data
DO $$
DECLARE
  new_user_id UUID;
BEGIN
"""

for user in parsed_users:
    # Extract fields based on index
    # (user_id, session_id, user_email, username, user_password, user_firstname, user_lastname, user_phone_number, user_image, user_status, user_role, token, date)
    orig_id = user[0]
    email = user[2]
    username = user[3]
    password_hash = user[4]
    first_name = user[5]
    last_name = user[6]
    phone = user[7]
    image = user[8]
    status = user[9]
    role = user[10]
    
    # Clean data
    if email is None or email == 'None': email = f"user_{orig_id}@example.com" # Fallback
    if username is None: username = email.split('@')[0]
    
    # Map role
    if role == 'admin':
        app_role = 'admin'
    else:
        app_role = 'authenticated'

    # SQL Block for this user
    sql_script += f"""
  -- User: {email}
  new_user_id := gen_random_uuid();
  
  -- Insert into auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated', -- Supabase role is usually 'authenticated' for all logged in users
    '{escape_sql(email)}',
    '{escape_sql(password_hash)}',
    NOW(), -- Auto confirm
    '{{"username": "{escape_sql(username)}", "full_name": "{escape_sql(first_name)} {escape_sql(last_name)}"}}',
    NOW(),
    NOW()
  );

  -- Insert into public.profiles
  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    username,
    phone_number,
    role,
    avatar_url
  ) VALUES (
    new_user_id,
    '{escape_sql(first_name)}',
    '{escape_sql(last_name)}',
    '{escape_sql(username)}',
    '{escape_sql(phone)}',
    '{escape_sql(role)}',
    {'NULL' if image is None else f"'{escape_sql(image)}'"}
  );
"""

sql_script += "END $$;"

print(sql_script)
