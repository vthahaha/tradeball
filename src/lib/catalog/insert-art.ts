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
  PA3: "/inserts/PA3.jpg", // Nikola Jokic
  PA4: "/inserts/PA4.jpg", // Pelle Larsson
  PA5: "/inserts/PA5.jpg", // Santi Aldama
  PA6: "/inserts/PA6.jpg", // Al Horford
  PA7: "/inserts/PA7.jpg", // Lauri Markkanen
  PA8: "/inserts/PA8.jpg", // VJ Edgecombe
  PA9: "/inserts/PA9.jpg", // Goga Bitadze
  PA10: "/inserts/PA10.jpg", // Dennis Schroder
  PA11: "/inserts/PA11.jpg", // Kristaps Porzingis
  PA12: "/inserts/PA12.jpg", // Domantas Sabonis
  PA13: "/inserts/PA13.jpg", // Khalifa Diop
  PA14: "/inserts/PA14.jpg", // Jusuf Nurkic
  PA15: "/inserts/PA15.jpg", // Alperen Sengun
  PA16: "/inserts/PA16.jpg", // Karlo Matkovic
  PA17: "/inserts/PA17.jpg", // Jonathan Kuminga
  PA18: "/inserts/PA18.jpg", // Shai Gilgeous-Alexander
  PA19: "/inserts/PA19.jpg", // Giannis Antetokounmpo
  PA20: "/inserts/PA20.jpg", // Khaman Maluach

  // Set 5: 2. Snipers
  SN1: "/inserts/SN1.jpg", // Desmond Bane
  SN2: "/inserts/SN2.jpg", // Sam Hauser
  SN3: "/inserts/SN3.jpg", // Norman Powell
  SN4: "/inserts/SN4.jpg", // Duncan Robinson
  SN5: "/inserts/SN5.jpg", // Kon Knueppel
  SN6: "/inserts/SN6.jpg", // Luke Kennard
  SN7: "/inserts/SN7.jpg", // Kevin Durant
  SN8: "/inserts/SN8.jpg", // Jared McCain
  SN9: "/inserts/SN9.jpg", // Damian Lillard
  SN10: "/inserts/SN10.jpg", // Stephen Curry

  // Set 5: 3. Dimers
  DI1: "/inserts/DI1.jpg", // Davion Mitchell
  DI2: "/inserts/DI2.jpg", // Trae Young
  DI3: "/inserts/DI3.jpg", // James Harden
  DI4: "/inserts/DI4.jpg", // Tyler Herro
  DI5: "/inserts/DI5.jpg", // LeBron James
  DI6: "/inserts/DI6.jpg", // Ty Jerome
  DI7: "/inserts/DI7.jpg", // LaMelo Ball
  DI8: "/inserts/DI8.jpg", // Darius Acuff Jr.
  DI9: "/inserts/DI9.jpg", // De'Aaron Fox
  DI10: "/inserts/DI10.jpg", // Keyonte George

  // Set 5: 4. Snatchers (ST: SN was taken by Snipers)
  ST1: "/inserts/ST1.jpg", // Jalen Johnson
  ST2: "/inserts/ST2.jpg", // Michael Porter Jr.
  ST3: "/inserts/ST3.jpg", // Ivica Zubac
  ST4: "/inserts/ST4.jpg", // Karl-Anthony Towns
  ST5: "/inserts/ST5.jpg", // Scottie Barnes
  ST6: "/inserts/ST6.jpg", // P.J. Washington
  ST7: "/inserts/ST7.jpg", // Brook Lopez
  ST8: "/inserts/ST8.jpg", // Walker Kessler
  ST9: "/inserts/ST9.jpg", // Derik Queen
  ST10: "/inserts/ST10.jpg", // Nikola Jokic

  // Set 6: 1. Thanksgiving
  TH1: "/inserts/TH1.jpg", // Stephon Castle
  TH2: "/inserts/TH2.jpg", // Jayson Tatum
  TH3: "/inserts/TH3.jpg", // Nickeil Alexander-Walker
  TH4: "/inserts/TH4.jpg", // Donovan Mitchell
  TH5: "/inserts/TH5.jpg", // Darryn Peterson
  TH6: "/inserts/TH6.jpg", // Ajay Mitchell
  TH7: "/inserts/TH7.jpg", // Franz Wagner
  TH8: "/inserts/TH8.jpg", // Zach LaVine
  TH9: "/inserts/TH9.jpg", // Amar'e Stoudemire
  TH10: "/inserts/TH10.jpg", // Kenyon Martin
  TH11: "/inserts/TH11.jpg", // Antonio McDyess
  TH12: "/inserts/TH12.jpg", // Rolando Blackman
  TH13: "/inserts/TH13.jpg", // Monta Ellis
  TH14: "/inserts/TH14.jpg", // Larry Johnson
  TH15: "/inserts/TH15.jpg", // Jeremy Lin

  // Set 6: 2. Spark Plug
  SPL1: "", // Lou Williams
  SPL2: "", // Jamal Crawford
  SPL3: "", // Keldon Johnson
  SPL4: "", // Payton Pritchard
  SPL5: "", // Kevin McHale
  SPL6: "", // Detlef Schrempf
  SPL7: "", // Ricky Pierce
  SPL8: "", // Eric Gordon
  SPL9: "", // Manu Ginobili
  SPL10: "", // Jason Terry

  // Set 6: 3. Supervillains
  VI1: "/inserts/VI1.jpg", // Draymond Green
  VI2: "/inserts/VI2.jpg", // Dillon Brooks
  VI3: "/inserts/VI3.jpg", // Bill Laimbeer
  VI4: "/inserts/VI4.jpg", // Christian Laettner
  VI5: "/inserts/VI5.jpg", // Vernon Maxwell
  VI6: "/inserts/VI6.jpg", // Stephen Jackson
  VI7: "/inserts/VI7.jpg", // Rick Fox
  VI8: "/inserts/VI8.jpg", // J.R. Smith
  VI9: "/inserts/VI9.jpg", // Bruce Bowen
  VI10: "/inserts/VI10.jpg", // Dennis Rodman
  VI11: "/inserts/VI11.jpg", // Patrick Beverley
  VI12: "/inserts/VI12.jpg", // Vlade Divac

  // Set 6: 4. The Circus
  CI1: "/inserts/CI1.jpg", // Jeff Teague
  CI2: "/inserts/CI2.jpg", // Nick Young
  CI3: "/inserts/CI3.jpg", // Russell Westbrook
  CI4: "/inserts/CI4.jpg", // Deandre Ayton
  CI5: "/inserts/CI5.jpg", // JaVale McGee
  CI6: "/inserts/CI6.jpg", // Steven Adams
  CI7: "/inserts/CI7.jpg", // Brian Scalabrine
  CI8: "/inserts/CI8.jpg", // LaMelo Ball
  CI9: "/inserts/CI9.jpg", // Giannis Antetokounmpo
  CI10: "/inserts/CI10.jpg", // Robin Lopez

  // Grail: Iconic Moments
  IM1: "/inserts/IM1.jpg", // The Last Shot, Michael Jordan
  IM2: "/inserts/IM2.jpg", // The Block, LeBron James
  IM3: "/inserts/IM3.jpg", // The 38 Feet, Stephen Curry
  IM4: "/inserts/IM4.jpg", // The Stepover, Allen Iverson
  IM5: "/inserts/IM5.jpg", // The 100th Point, Wilt Chamberlain
};
