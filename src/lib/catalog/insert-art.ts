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
  SF3: "/inserts/SF3.JPG", // Jaren Jackson Jr.
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
  CC1: "/inserts/CC1.jpg", // Kevin Willis
  CC2: "/inserts/CC2.jpg", // Rajon Rondo
  CC3: "/inserts/CC3.jpg", // Buck Williams
  CC4: "/inserts/CC4.JPG", // Bismack Biyombo
  CC5: "/inserts/CC5.JPG", // Bob Love
  CC6: "/inserts/CC6.jpg", // Austin Carr
  CC7: "/inserts/CC7.jpg", // Jason Terry
  CC8: "/inserts/CC8.jpg", // Kiki Vandeweghe
  CC9: "/inserts/CC9.jpg", // Rick Mahorn
  CC10: "/inserts/CC10.jpg", // Chris Mullin
  CC11: "/inserts/CC11.JPG", // Rudy Tomjanovich
  CC12: "/inserts/CC12.jpg", // Victor Oladipo
  CC13: "/inserts/CC13.jpg", // Chris Kaman
  CC14: "/inserts/CC14.jpg", // Derek Fisher
  CC15: "/inserts/CC15.jpg", // Shareef Abdur-Rahim
  CC16: "/inserts/CC16.jpg", // Rony Seikaly
  CC17: "/inserts/CC17.jpg", // Michael Redd
  CC18: "/inserts/CC18.jpg", // Christian Laettner
  CC19: "/inserts/CC19.jpg", // David West
  CC20: "/inserts/CC20.jpg", // Allan Houston
  CC21: "/inserts/CC21.JPG", // Gus Williams
  CC22: "/inserts/CC22.jpg", // Rafer Alston
  CC23: "/inserts/CC23.JPG", // Clarence Weatherspoon
  CC24: "/inserts/CC24.jpg", // Kevin Johnson
  CC25: "/inserts/CC25.jpg", // Jim Paxson
  CC26: "/inserts/CC26.jpg", // DeMarcus Cousins
  CC27: "/inserts/CC27.jpg", // Bruce Bowen
  CC28: "/inserts/CC28.jpg", // Damon Stoudamire
  CC29: "/inserts/CC29.jpg", // Mark Eaton
  CC30: "/inserts/CC30.jpg", // Brendan Haywood

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
  FB1: "/inserts/FB1.jpg", // Jason Williams
  FB2: "/inserts/FB2.jpg", // Pete Maravich
  FB3: "/inserts/FB3.jpg", // Vince Carter
  FB4: "/inserts/FB4.png", // Magic Johnson
  FB5: "/inserts/FB5.jpg", // Allen Iverson
  FB6: "/inserts/FB6.jpg", // Stephen Curry
  FB7: "/inserts/FB7.jpg", // Kyrie Irving
  FB8: "/inserts/FB8.jpg", // Shawn Kemp
  FB9: "/inserts/FB9.jpg", // Steve Nash
  FB10: "/inserts/FB10.jpg", // Dwyane Wade
  FB11: "/inserts/FB11.jpg", // Manu Ginobili
  FB12: "/inserts/FB12.jpg", // Blake Griffin
  FB13: "/inserts/FB13.jpg", // Nikola Jokic
  FB14: "/inserts/FB14.jpg", // Jamal Crawford
  FB15: "/inserts/FB15.jpg", // Ja Morant

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
  FF1: "/inserts/FF1.jpg", // Mark Aguirre
  FF2: "/inserts/FF2.jpg", // Larry Johnson
  FF3: "/inserts/FF3.png", // Glenn Rice
  FF4: "/inserts/FF4.jpg", // Kevin Garnett
  FF5: "/inserts/FF5.jpg", // Shaquille O'Neal
  FF6: "/inserts/FF6.jpg", // Damon Stoudamire
  FF7: "/inserts/FF7.jpg", // Shareef Abdur-Rahim
  FF8: "/inserts/FF8.jpg", // Baron Davis

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

  // Set 4: 1. Lunar New Year
  LNY1: "/inserts/LNY1.jpg", // Carmelo Anthony
  LNY2: "/inserts/LNY2.jpg", // De'Aaron Fox
  LNY3: "/inserts/LNY3.jpg", // Ben Wallace
  LNY4: "/inserts/LNY4.jpg", // Mark Price
  LNY5: "/inserts/LNY5.jpg", // Tyrese Haliburton
  LNY6: "/inserts/LNY6.jpg", // Isaiah Thomas
  LNY7: "/inserts/LNY7.jpg", // Dirk Nowitzki
  LNY8: "/inserts/LNY8.jpg", // Shaedon Sharpe
  LNY9: "/inserts/LNY9.jpg", // Gary Payton
  LNY10: "/inserts/LNY10.jpg", // Bradley Beal
  LNY11: "/inserts/LNY11.jpg", // Dwyane Wade
  LNY12: "/inserts/LNY12.jpg", // Penny Hardaway

  // Set 4: 2. Day of the Dead
  DD1: "/inserts/DD1.jpg", // Dylan Harper
  DD2: "/inserts/DD2.jpg", // Alperen Sengun
  DD3: "/inserts/DD3.jpg", // LaMelo Ball
  DD4: "/inserts/DD4.jpg", // Jimmy Butler
  DD5: "/inserts/DD5.jpg", // Jamal Murray
  DD6: "/inserts/DD6.jpg", // Devin Booker
  DD7: "/inserts/DD7.jpg", // Rui Hachimura
  DD8: "/inserts/DD8.jpg", // Lauri Markkanen
  DD9: "/inserts/DD9.jpg", // Joel Embiid
  DD10: "/inserts/DD10.jpg", // Jalen Johnson
  DD11: "/inserts/DD11.jpg", // Karl-Anthony Towns
  DD12: "/inserts/DD12.jpg", // Scottie Barnes
  DD13: "/inserts/DD13.jpg", // Pascal Siakam
  DD14: "/inserts/DD14.jpg", // AJ Dybantsa
  DD15: "/inserts/DD15.jpg", // Josh Giddey
  DD16: "/inserts/DD16.jpg", // James Worthy
  DD17: "/inserts/DD17.jpg", // Clyde Drexler
  DD18: "/inserts/DD18.jpg", // Zach Randolph
  DD19: "/inserts/DD19.jpg", // Russell Westbrook
  DD20: "/inserts/DD20.jpg", // Jason Kidd
  DD21: "/inserts/DD21.jpg", // Baron Davis
  DD22: "/inserts/DD22.jpg", // Oscar Robertson
  DD23: "/inserts/DD23.jpg", // Paul Pierce
  DD24: "/inserts/DD24.jpg", // Isiah Thomas
  DD25: "/inserts/DD25.jpg", // Ray Allen
  DD26: "/inserts/DD26.jpg", // Anderson Varejão
  DD27: "/inserts/DD27.jpg", // Dwight Howard
  DD28: "/inserts/DD28.jpg", // Alonzo Mourning
  DD29: "/inserts/DD29.jpg", // Drazen Petrovic
  DD30: "/inserts/DD30.jpg", // Glenn Robinson

  // Set 4: 3. The Third Eye
  TE1: "/inserts/TE1.png", // Kyrie Irving
  TE2: "/inserts/TE2.png", // Paul George
  TE3: "/inserts/TE3.png", // Yaxel Lendeborg
  TE4: "/inserts/TE4.png", // Davion Mitchell
  TE5: "/inserts/TE5.png", // Michael Porter Jr.
  TE6: "/inserts/TE6.png", // Norman Powell
  TE7: "/inserts/TE7.png", // Yang Hansen
  TE8: "/inserts/TE8.png", // Paolo Banchero
  TE9: "/inserts/TE9.png", // Tyler Herro
  TE10: "/inserts/TE10.png", // Jeremiah Fears
  TE11: "/inserts/TE11.png", // T.J. McConnell
  TE12: "/inserts/TE12.png", // Jalen Williams
  TE13: "/inserts/TE13.png", // Ausar Thompson
  TE14: "/inserts/TE14.png", // Mikal Bridges
  TE15: "/inserts/TE15.png", // Austin Reaves

  // Set 5: 1. Passports
  PA1: "/inserts/PA1.jpg", // Victor Wembanyama
  PA2: "/inserts/PA2.jpg", // Luka Doncic
  PA3: "", // Nikola Jokic
  PA4: "", // Pelle Larsson
  PA5: "", // Santi Aldama
  PA6: "", // Al Horford
  PA7: "", // Lauri Markkanen
  PA8: "", // VJ Edgecombe
  PA9: "", // Goga Bitadze
  PA10: "", // Dennis Schroder
  PA11: "", // Kristaps Porzingis
  PA12: "", // Domantas Sabonis
  PA13: "", // Khalifa Diop
  PA14: "", // Egor Demin
  PA15: "", // Alperen Sengun
  PA16: "", // Karlo Matkovic
  PA17: "", // Jonathan Kuminga
  PA18: "", // Steven Adams
  PA19: "", // Giannis Antetokounmpo
  PA20: "", // OG Anunoby

  // Set 5: 2. Snipers
  SN1: "", // Desmond Bane
  SN2: "", // Sam Hauser
  SN3: "", // Norman Powell
  SN4: "", // Duncan Robinson
  SN5: "", // Kon Knueppel
  SN6: "", // Luke Kennard
  SN7: "", // Kevin Durant
  SN8: "", // Jared McCain
  SN9: "", // Damian Lillard
  SN10: "", // Stephen Curry

  // Set 5: 3. Dimers
  DI1: "", // Davion Mitchell
  DI2: "", // Trae Young
  DI3: "", // James Harden
  DI4: "", // Tyler Herro
  DI5: "", // LeBron James
  DI6: "", // Ty Jerome
  DI7: "", // LaMelo Ball
  DI8: "", // Darius Acuff Jr.
  DI9: "", // De'Aaron Fox
  DI10: "", // Keyonte George

  // Set 5: 4. Snatchers (ST: SN was taken by Snipers)
  ST1: "", // Jalen Johnson
  ST2: "", // Michael Porter Jr.
  ST3: "", // Ivica Zubac
  ST4: "", // Karl-Anthony Towns
  ST5: "", // Scottie Barnes
  ST6: "", // P.J. Washington
  ST7: "", // Brook Lopez
  ST8: "", // Walker Kessler
  ST9: "", // Derik Queen
  ST10: "", // Nikola Jokic

  // Grail: Iconic Moments
  IM1: "/inserts/IM1.jpg", // The Last Shot, Michael Jordan
  IM2: "/inserts/IM2.jpg", // The Block, LeBron James
  IM3: "/inserts/IM3.jpg", // The 38 Feet, Stephen Curry
  IM4: "/inserts/IM4.jpg", // The Stepover, Allen Iverson
  IM5: "/inserts/IM5.jpg", // The 100th Point, Wilt Chamberlain
};
