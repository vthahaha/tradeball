// Splash art for insert cards, keyed by the card id from the insert document.
// Leave "" to show the player initials on the class background.
//
// Paste an image URL, or drop a file in /public/inserts and point at it:
//   NB1: "/inserts/NB1.webp",
//   GE9: "https://example.com/bam-83.jpg",
// The image is cropped to fill the art panel, so portrait or square shots work best.
export const INSERT_ART: Record<string, string> = {
  // 1. New Blood
  NB1: "", // Jaylen Brown
  NB2: "", // LeBron James
  NB3: "", // Giannis Antetokounmpo
  NB4: "", // Santi Aldama
  NB5: "", // Walker Kessler
  NB6: "", // Tobias Harris
  NB7: "", // Mitchell Robinson
  NB8: "", // Kawhi Leonard
  NB9: "", // Luguentz Dort
  NB10: "", // Jonathan Kuminga
  NB11: "", // Ja Morant
  NB12: "", // DeMar DeRozan
  NB13: "", // LaMelo Ball
  NB14: "", // Julius Randle
  NB15: "", // Norman Powell

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
  GB1: "", // Victor Wembanyama
  GB2: "", // Cooper Flagg
  GB3: "", // Dylan Harper
  GB4: "", // Stephon Castle
  GB5: "", // Kon Knueppel
  GB6: "", // VJ Edgecombe
  GB7: "", // Jalen Duren
  GB8: "", // Donovan Clingan
  GB9: "", // Matas Buzelis
  GB10: "", // Ace Bailey

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
  US1: "", // Shai Gilgeous-Alexander
  US2: "", // Luka Doncic
  US3: "", // Victor Wembanyama
  US4: "", // Jalen Brunson
  US5: "", // Donovan Mitchell
  US6: "", // Tyrese Maxey
  US7: "", // Anthony Edwards
  US8: "", // Nikola Jokic
  US9: "", // LeBron James
  US10: "", // Cade Cunningham

  // 6. The Light
  TL1: "", // Dyson Daniels
  TL2: "", // Neemias Queta
  TL3: "", // Egor Demin
  TL4: "", // Ryan Kalkbrenner
  TL5: "", // Jalen Smith
  TL6: "", // Jarrett Allen
  TL7: "", // Duncan Robinson
  TL8: "", // Ivica Zubac
  TL9: "", // Pelle Larsson
  TL10: "", // Kel'el Ware
  TL11: "", // Josh Hart
  TL12: "", // Wendell Carter Jr.
  TL13: "", // Anfernee Simons
  TL14: "", // RJ Barrett
  TL15: "", // Alex Sarr

  // 7. The Shadow
  TS1: "", // Max Christie
  TS2: "", // Aaron Gordon
  TS3: "", // Brandin Podziemski
  TS4: "", // Fred VanVleet
  TS5: "", // Rui Hachimura
  TS6: "", // Matisse Thybulle
  TS7: "", // Zach Edey
  TS8: "", // Jaden McDaniels
  TS9: "", // Saddiq Bey
  TS10: "", // Cason Wallace
  TS11: "", // Dillon Brooks
  TS12: "", // Scoot Henderson
  TS13: "", // Keegan Murray
  TS14: "", // Julian Champagnie
  TS15: "", // Kyle Filipowski

  // 8. Stone Fortress
  SF1: "", // Rudy Gobert
  SF2: "", // Evan Mobley
  SF3: "", // Jaren Jackson Jr.
  SF4: "", // Ausar Thompson
  SF5: "", // Chet Holmgren
  SF6: "", // Derrick White
  SF7: "", // OG Anunoby
  SF8: "", // Scottie Barnes
  SF9: "", // Toumani Camara
  SF10: "", // Draymond Green
  SF11: "", // Amen Thompson
  SF12: "", // Kris Dunn

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
