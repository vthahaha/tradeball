// Splash art for insert cards, keyed by the card id from the insert document.
// Leave "" to show the player initials on the class background.
//
// Paste an image URL, or drop a file in /public/inserts and point at it:
//   HG1: "/inserts/HG1.jpg",
//   GE9: "https://example.com/bam-83.jpg",
// The image is cropped to fill the art panel, so portrait or square shots work best.
// New Blood (NB) cards always use the player's ESPN headshot and take no art here.
export const INSERT_ART: Record<string, string> = {
  // 2. Hard Goodbyes
  HG1: "/inserts/HG1.jpg", // Garrett Temple
  HG2: "/inserts/HG2.jpg", // Chris Paul
  HG3: "/inserts/HG3.jpg", // Kyle Lowry
  HG4: "/inserts/HG4.jpg", // Taj Gibson
  HG5: "/inserts/HG5.jpg", // Nicolas Batum
  HG6: "/inserts/HG6.jpg", // Isaiah Whitehead
  HG7: "/inserts/HG7.jpg", // Malcolm Brogdon
  HG8: "/inserts/HG8.jpg", // Danilo Gallinari
  HG9: "/inserts/HG9.jpg", // P.J. Tucker
  HG10: "/inserts/HG10.jpg", // Russell Westbrook

  // 3. Golden Boy
  GB1: "/inserts/GB1.png", // Victor Wembanyama
  GB2: "/inserts/GB2.png", // Cooper Flagg
  GB3: "/inserts/GB3.png", // Dylan Harper
  GB4: "/inserts/GB4.png", // Stephon Castle
  GB5: "/inserts/GB5.png", // Kon Knueppel
  GB6: "/inserts/GB6.png", // VJ Edgecombe
  GB7: "/inserts/GB7.png", // Jalen Duren
  GB8: "/inserts/GB8.png", // Donovan Clingan
  GB9: "/inserts/GB9.png", // Matas Buzelis
  GB10: "/inserts/GB10.png", // Ace Bailey

  // 4. Generational  
  GE1: "/inserts/GE1.jpg", // Nikola Jokic
  GE2: "/inserts/GE2.jpg", // Victor Wembanyama
  GE3: "/inserts/GE3.jpg", // Jalen Brunson
  GE4: "/inserts/GE4.jpg", // Luka Doncic
  GE5: "/inserts/GE5.jpg", // Kawhi Leonard
  GE6: "/inserts/GE6.jpg", // Cooper Flagg
  GE7: "/inserts/GE7.jpg", // Shai Gilgeous-Alexander
  GE8: "/inserts/GE8.jpg", // Stephen Curry
  GE9: "/inserts/GE9.jpg", // Bam Adebayo

  // 5. Ultimate Stardom
  US1: "/inserts/US1.jpg", // Shai Gilgeous-Alexander
  US2: "/inserts/US2.jpg", // Luka Doncic
  US3: "/inserts/US3.jpg", // Victor Wembanyama
  US4: "/inserts/US4.jpg", // Jalen Brunson
  US5: "/inserts/US5.jpg", // Donovan Mitchell
  US6: "/inserts/US6.jpg", // Tyrese Maxey
  US7: "/inserts/US7.jpg", // Anthony Edwards
  US8: "/inserts/US8.jpg", // Nikola Jokic
  US9: "/inserts/US9.jpg", // LeBron James
  US10: "/inserts/US10.jpg", // Cade Cunningham

  // 6. The Light
  TL1: "/inserts/TL1.png", // Dyson Daniels
  TL2: "/inserts/TL2.png", // Neemias Queta
  TL3: "/inserts/TL3.png", // Egor Demin
  TL4: "/inserts/TL4.png", // Ryan Kalkbrenner
  TL5: "/inserts/TL5.png", // Jalen Smith
  TL6: "/inserts/TL6.png", // Jarrett Allen
  TL7: "/inserts/TL7.png", // Duncan Robinson
  TL8: "/inserts/TL8.png", // Ivica Zubac
  TL9: "/inserts/TL9.png", // Pelle Larsson
  TL10: "/inserts/TL10.png", // Kel'el Ware
  TL11: "/inserts/TL11.png", // Josh Hart
  TL12: "/inserts/TL12.png", // Wendell Carter Jr.
  TL13: "/inserts/TL13.png", // Anfernee Simons
  TL14: "/inserts/TL14.png", // RJ Barrett
  TL15: "/inserts/TL15.png", // Alex Sarr

  // 7. The Shadow
  TS1: "/inserts/TS1.png", // Max Christie
  TS2: "/inserts/TS2.png", // Aaron Gordon
  TS3: "/inserts/TS3.png", // Brandin Podziemski
  TS4: "/inserts/TS4.png", // Fred VanVleet
  TS5: "/inserts/TS5.png", // Rui Hachimura
  TS6: "/inserts/TS6.png", // Matisse Thybulle
  TS7: "/inserts/TS7.png", // Zach Edey
  TS8: "/inserts/TS8.png", // Jaden McDaniels
  TS9: "/inserts/TS9.png", // Saddiq Bey
  TS10: "/inserts/TS10.png", // Cason Wallace
  TS11: "/inserts/TS11.png", // Dillon Brooks
  TS12: "/inserts/TS12.png", // Scoot Henderson
  TS13: "/inserts/TS13.png", // Keegan Murray
  TS14: "/inserts/TS14.png", // Julian Champagnie
  TS15: "/inserts/TS15.png", // Kyle Filipowski

  // 8. Stone Fortress
  SF1: "/inserts/SF1.jpg", // Rudy Gobert
  SF2: "/inserts/SF2.jpg", // Evan Mobley
  SF3: "/inserts/SF3.jpg", // Jaren Jackson Jr.
  SF4: "/inserts/SF4.jpg", // Ausar Thompson
  SF5: "/inserts/SF5.jpg", // Chet Holmgren
  SF6: "/inserts/SF6.jpg", // Derrick White
  SF7: "/inserts/SF7.jpg", // OG Anunoby
  SF8: "/inserts/SF8.jpg", // Scottie Barnes
  SF9: "/inserts/SF9.jpg", // Toumani Camara
  SF10: "/inserts/SF10.jpg", // Draymond Green
  SF11: "/inserts/SF11.jpg", // Amen Thompson
  SF12: "/inserts/SF12.jpg", // Kris Dunn

  // 9. Cult Classic
  CC1: "", // Kevin Willis
  CC2: "", // Reggie Lewis
  CC3: "", // Buck Williams
  CC4: "", // Bismack Biyombo
  CC5: "", // Bob Love
  CC6: "", // Austin Carr
  CC7: "", // Jason Terry
  CC8: "", // Kiki Vandeweghe
  CC9: "", // Rick Mahorn
  CC10: "", // Chris Mullin
  CC11: "", // Rudy Tomjanovich
  CC12: "", // Victor Oladipo
  CC13: "", // Chris Kaman
  CC14: "", // Derek Fisher
  CC15: "", // Shareef Abdur-Rahim
  CC16: "", // Rony Seikaly
  CC17: "", // Michael Redd
  CC18: "", // Christian Laettner
  CC19: "", // David West
  CC20: "", // Allan Houston
  CC21: "", // Gus Williams
  CC22: "", // Rafer Alston
  CC23: "", // Clarence Weatherspoon
  CC24: "", // Kevin Johnson
  CC25: "", // Jim Paxson
  CC26: "", // DeMarcus Cousins
  CC27: "", // Bruce Bowen
  CC28: "", // Damon Stoudamire
  CC29: "", // Mark Eaton
  CC30: "", // Brendan Haywood

  // Set 2: A. Best of the Best
  BOTB1: "/inserts/BOTB1.jpg", // Jalen Brunson
  BOTB2: "/inserts/BOTB2.jpg", // Shai Gilgeous-Alexander
  BOTB3: "/inserts/BOTB3.jpg", // Jaylen Brown
  BOTB4: "/inserts/BOTB4.jpg", // LeBron James
  BOTB5: "/inserts/BOTB5.jpg", // Dirk Nowitzki
  BOTB6: "/inserts/BOTB6.jpg", // Kobe Bryant
  BOTB7: "/inserts/BOTB7.jpg", // Tim Duncan
  BOTB8: "/inserts/BOTB8.jpg", // Chauncey Billups
  BOTB9: "/inserts/BOTB9.jpg", // Dennis Johnson
  BOTB10: "/inserts/BOTB10.jpg", // Hakeem Olajuwon
  BOTB11: "/inserts/BOTB11.jpg", // Michael Jordan
  BOTB12: "/inserts/BOTB12.jpg", // Joe Dumars
  BOTB13: "/inserts/BOTB13.jpg", // Moses Malone
  BOTB14: "/inserts/BOTB14.jpg", // BOTB12l Walton
  BOTB15: "/inserts/BOTB15.jpg", // Rick Barry

  // Set 2: B. Rivalries
  RV1: "/inserts/RV1.jpg", // Larry Bird & Magic Johnson
  RV2: "/inserts/RV2.jpg", // Michael Jordan & Isiah Thomas
  RV3: "/inserts/RV3.jpg", // LeBron James & Stephen Curry
  RV4: "/inserts/RV4.jpg", // Tim Duncan & Dirk Nowitzki
  RV5: "/inserts/RV5.jpg", // Charles Barkley & Karl Malone
  RV6: "/inserts/RV6.jpg", // Anthony Edwards & Shai Gilgeous-Alexander
  RV7: "/inserts/RV7.jpg", // Bill Russell & Wilt Chamberlain
  RV8: "/inserts/RV8.jpg", // Kareem Abdul-Jabbar & Bob Lanier
  RV9: "/inserts/RV9.jpg", // Allen Iverson & Kobe Bryant
  RV10: "/inserts/RV10.jpg", // Shaquille O'Neal & Dwight Howard

  // Set 3: 1. Flash of Brilliance
  FB1: "", // Jason Williams
  FB2: "", // Pete Maravich
  FB3: "", // Vince Carter
  FB4: "", // Magic Johnson
  FB5: "", // Allen Iverson
  FB6: "", // Stephen Curry
  FB7: "", // Kyrie Irving
  FB8: "", // Shawn Kemp
  FB9: "", // Steve Nash
  FB10: "", // Dwyane Wade
  FB11: "", // Manu Ginobili
  FB12: "", // Blake Griffin
  FB13: "", // Nikola Jokic
  FB14: "", // Jamal Crawford
  FB15: "", // Ja Morant

  // Set 3: 2. Time Wizards
  TW1: "/inserts/TW1.png", // Arvydas Sabonis
  TW2: "/inserts/TW2.png", // Andrei Kirilenko
  TW3: "/inserts/TW3.png", // Chris Bosh
  TW4: "/inserts/TW4.png", // Peja Stojakovic
  TW5: "/inserts/TW5.png", // Shawn Marion
  TW6: "/inserts/TW6.png", // Rasheed Wallace
  TW7: "/inserts/TW7.png", // Toni Kukoc
  TW8: "/inserts/TW8.png", // Lamar Odom
  TW9: "/inserts/TW9.png", // Bob McAdoo
  TW10: "/inserts/TW10.png", // Sam Perkins

  // Set 3: 3. Founding Father
  FF1: "", // Mark Aguirre
  FF2: "", // Larry Johnson
  FF3: "", // Glenn Rice
  FF4: "", // Kevin Garnett
  FF5: "", // Shaquille O'Neal
  FF6: "", // Damon Stoudamire
  FF7: "", // Shareef Abdur-Rahim
  FF8: "", // Baron Davis

  // Set 3: 4. The Dream Team
  DT1: "/inserts/DT1.jpg", // Charles Barkley
  DT2: "/inserts/DT2.jpg", // Larry Bird
  DT3: "/inserts/DT3.jpg", // Clyde Drexler
  DT4: "/inserts/DT4.jpg", // Patrick Ewing
  DT5: "/inserts/DT5.jpg", // Michael Jordan
  DT6: "/inserts/DT6.jpg", // Magic Johnson
  DT7: "/inserts/DT7.jpg", // Christian Laettner
  DT8: "/inserts/DT8.jpg", // Karl Malone
  DT9: "/inserts/DT9.jpg", // Chris Mullin
  DT10: "/inserts/DT10.jpg", // Scottie Pippen
  DT11: "/inserts/DT11.jpg", // David Robinson
  DT12: "/inserts/DT12.jpg", // John Stockton
};
