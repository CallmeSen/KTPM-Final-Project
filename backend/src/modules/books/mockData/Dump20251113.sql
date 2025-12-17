-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: bookstores
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `blacklist`
--

DROP TABLE IF EXISTS `blacklist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blacklist` (
  `id` varchar(36) NOT NULL,
  `accessToken` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blacklist`
--

LOCK TABLES `blacklist` WRITE;
/*!40000 ALTER TABLE `blacklist` DISABLE KEYS */;
INSERT INTO `blacklist` VALUES ('102ada76-f6ce-4e35-a83a-f56c0c6b86b5','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZTIzYTFkMC1hMjgwLTQyMDEtODAxOS1hYzNjNTdhYmU5YzYiLCJpYXQiOjE3NjI0MTY5ODAsImV4cCI6MTc2MjQxNzg4MH0.LRduYeGCZs0gM_F2QPcSKFa6ef3sjz7oxJRF_irAqFk'),('25705f1d-9881-4295-8d4a-81f6cec2327e','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4ODAyOWMwMi1iYjAzLTQwNjQtYTgzZS0yMzQ1NzYxZjQwYTMiLCJpYXQiOjE3NjI0NDMzOTEsImV4cCI6MTc2MjQ0NDI5MX0.BRK8OgBO4KtBg4pxtJB_AT0be6TFX7YJXgwbyD6rmds'),('36a31bb5-2e78-4a18-91c3-6f6e669f6a19','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZTIzYTFkMC1hMjgwLTQyMDEtODAxOS1hYzNjNTdhYmU5YzYiLCJpYXQiOjE3NjI0MTY5ODAsImV4cCI6MTc2MjQxNzg4MH0.LRduYeGCZs0gM_F2QPcSKFa6ef3sjz7oxJRF_irAqFk'),('3b95afa3-c995-4111-9491-a731f3f9ebc1','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZTIzYTFkMC1hMjgwLTQyMDEtODAxOS1hYzNjNTdhYmU5YzYiLCJpYXQiOjE3NjI0MTY5ODAsImV4cCI6MTc2MjQxNzg4MH0.LRduYeGCZs0gM_F2QPcSKFa6ef3sjz7oxJRF_irAqFk'),('5ce1ca6f-3219-445c-ad29-0cf0b51e2e98','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZTIzYTFkMC1hMjgwLTQyMDEtODAxOS1hYzNjNTdhYmU5YzYiLCJpYXQiOjE3NjI0MTY5ODAsImV4cCI6MTc2MjQxNzg4MH0.LRduYeGCZs0gM_F2QPcSKFa6ef3sjz7oxJRF_irAqFk'),('7e779dc6-e6fa-439d-9cfd-2c21f02f538c','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZTIzYTFkMC1hMjgwLTQyMDEtODAxOS1hYzNjNTdhYmU5YzYiLCJpYXQiOjE3NjI0MTY5ODAsImV4cCI6MTc2MjQxNzg4MH0.LRduYeGCZs0gM_F2QPcSKFa6ef3sjz7oxJRF_irAqFk'),('83fba301-7dfc-491a-ba66-a8d55bcfd743','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZTIzYTFkMC1hMjgwLTQyMDEtODAxOS1hYzNjNTdhYmU5YzYiLCJpYXQiOjE3NjI0MTQ3MTMsImV4cCI6MTc2MjQxNTYxM30.NZJivSPzDJ3HTXroFTN25aC200QzrcgHpLiJ2N1jY9g'),('8f9a67cd-a7b6-4a5a-ac31-26737e335d12','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNWU1NzFhNS0yODY4LTRhMDMtODZhYy05ZDRhNDZkNzU5MGQiLCJpYXQiOjE3NTg1NDIwMTgsImV4cCI6MTc1ODU0MjkxOH0.iT2MwdIrDZ88YSLmgg2C4WGIV8TCIW0aBOSTuxeDl4M'),('94104ee9-3ca1-4ee1-b141-e6d42bb2da3c','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNWU1NzFhNS0yODY4LTRhMDMtODZhYy05ZDRhNDZkNzU5MGQiLCJpYXQiOjE3NTg1NDIwNjQsImV4cCI6MTc1ODU0Mjk2NH0.a1sCr84E8acKIXmR1sZWIupZAaWyEWvbXYEv_et2xE0'),('9a98759b-4ae4-498d-9312-b46d6950b732','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZTIzYTFkMC1hMjgwLTQyMDEtODAxOS1hYzNjNTdhYmU5YzYiLCJpYXQiOjE3NjI0MTY5ODAsImV4cCI6MTc2MjQxNzg4MH0.LRduYeGCZs0gM_F2QPcSKFa6ef3sjz7oxJRF_irAqFk'),('a9ee4947-403a-472a-b643-8c52f05c799f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNWU1NzFhNS0yODY4LTRhMDMtODZhYy05ZDRhNDZkNzU5MGQiLCJpYXQiOjE3NjI0MTQ1ODMsImV4cCI6MTc2MjQxNTQ4M30.q_AhHEbOARp049rkdEv2-b1z5v4dMjo40yguKD5YcJM'),('b50ded19-823c-4fe8-9783-5ab88c50f9c9','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZTIzYTFkMC1hMjgwLTQyMDEtODAxOS1hYzNjNTdhYmU5YzYiLCJpYXQiOjE3NjI0MTY5ODAsImV4cCI6MTc2MjQxNzg4MH0.LRduYeGCZs0gM_F2QPcSKFa6ef3sjz7oxJRF_irAqFk'),('bd10d1a0-16ad-46c1-bd2a-a556504f851b','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZTIzYTFkMC1hMjgwLTQyMDEtODAxOS1hYzNjNTdhYmU5YzYiLCJpYXQiOjE3NjI0MTY5ODAsImV4cCI6MTc2MjQxNzg4MH0.LRduYeGCZs0gM_F2QPcSKFa6ef3sjz7oxJRF_irAqFk'),('ce5ccfe4-c5bc-41cd-ae23-8df8763a93ca','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZTIzYTFkMC1hMjgwLTQyMDEtODAxOS1hYzNjNTdhYmU5YzYiLCJpYXQiOjE3NjI0MTY5ODAsImV4cCI6MTc2MjQxNzg4MH0.LRduYeGCZs0gM_F2QPcSKFa6ef3sjz7oxJRF_irAqFk'),('d03f1add-8606-4bc5-87dd-68c19f31e258','sadjsalkdmsalkdmlsk'),('daa33e27-c07e-4520-bcee-9f5631a927db','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNWU1NzFhNS0yODY4LTRhMDMtODZhYy05ZDRhNDZkNzU5MGQiLCJpYXQiOjE3NTg1NDA5OTIsImV4cCI6MTc1ODU0MTg5Mn0.TKfwf51YinMN1LZQpUfeUg44qFF1HjNEpTGln546z88'),('e02ad32e-a165-4c26-87f8-dee7fb2e3450','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZTIzYTFkMC1hMjgwLTQyMDEtODAxOS1hYzNjNTdhYmU5YzYiLCJpYXQiOjE3NjI0MTY5ODAsImV4cCI6MTc2MjQxNzg4MH0.LRduYeGCZs0gM_F2QPcSKFa6ef3sjz7oxJRF_irAqFk'),('fd3365ef-3d2c-46e6-8cbc-ccc48f0370be','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZTIzYTFkMC1hMjgwLTQyMDEtODAxOS1hYzNjNTdhYmU5YzYiLCJpYXQiOjE3NjI0MTY5ODAsImV4cCI6MTc2MjQxNzg4MH0.LRduYeGCZs0gM_F2QPcSKFa6ef3sjz7oxJRF_irAqFk'),('ff08c248-d9e0-4f3d-9b73-5fa42d636f39','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZTIzYTFkMC1hMjgwLTQyMDEtODAxOS1hYzNjNTdhYmU5YzYiLCJpYXQiOjE3NjI0MTY5ODAsImV4cCI6MTc2MjQxNzg4MH0.LRduYeGCZs0gM_F2QPcSKFa6ef3sjz7oxJRF_irAqFk');
/*!40000 ALTER TABLE `blacklist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `books`
--

DROP TABLE IF EXISTS `books`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `books` (
  `id` varchar(36) NOT NULL,
  `title` text NOT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `authors` text,
  `categories` text,
  `thumbnail` varchar(255) DEFAULT NULL,
  `description` longtext,
  `published_year` int DEFAULT NULL,
  `average_rating` float DEFAULT NULL,
  `num_pages` int DEFAULT NULL,
  `ratings_count` int DEFAULT NULL,
  `price` float DEFAULT NULL,
  `id_stripe` varchar(255) DEFAULT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `books`
--

LOCK TABLES `books` WRITE;
/*!40000 ALTER TABLE `books` DISABLE KEYS */;
INSERT INTO `books` VALUES ('00002077-14fc-4aa6-b67d-1cc8d11f5bc6','The Music of Chance',NULL,'Paul Auster','Fiction','http://books.google.com/books/content?id=gf_sRKKiwgwC&printsec=frontcover&img=1&zoom=1&source=gbs_api','An \"exceptional\" (Los Angeles Times) tale of fate, loyalty, responsibility, and the real meaning of freedom, from the author of the forthcoming 4 3 2 1: A Novel A finalist for the PEN/Faulkner Award This \"rich and dazzling\" (Wall Street Journal) novel follows Jim Nashe who, after squandering an unexpected inheritance, picks up a young gambler named Jack Pozzi hoping to con two millionaires. But when their plans backfire, Jim and Jack are indentured by their elusive marks and are forced to build a meaningless wall with bricks gathered from ruins of an Irish castle. Time passes, their debts mount, and anger builds as the two struggle to dig themselves out of their Kafkaesque serfdom. New York Times-bestselling author Paul Auster (The New York Trilogy) brings us back into his strange, shape-shifting world of fiendish bargains and punitive whims, where chance is a powerful yet unpredictable force.',1991,3.9,217,354,217,'prod_TPgfyAHkNvTRNE',1),('0012e929-c505-44fe-a378-05486f51652d','Geisha',NULL,'Liza Crihfield Dalby','Social Science','http://books.google.com/books/content?id=LGTVNSYrKucC&printsec=frontcover&img=1&zoom=1&source=gbs_api','00 In this classic best-seller, Liza Dalby, the only non-Japanese ever to have trained as a geisha, offers an insider\'s look at the exclusive world of female companions to the Japanese male elite. Her new preface considers the geisha today as a vestige of tradition as Japan heads into the 21st century. In this classic best-seller, Liza Dalby, the only non-Japanese ever to have trained as a geisha, offers an insider\'s look at the exclusive world of female companions to the Japanese male elite. Her new preface considers the geisha today as a vestige of tradition as Japan heads into the 21st century.',1998,4,367,3646,367,'prod_TPgf438qAEk50r',1),('0014ec61-eef2-4c58-9bfe-51046ffff113','A Second Chance at Eden',NULL,'Peter F. Hamilton','Science fiction','http://books.google.com/books/content?id=foyS8cdFJQkC&printsec=frontcover&img=1&zoom=1&source=gbs_api','This novella and six stories are set in the same universe and time-line as the Night\'s Dawn trilogy.',1999,4.02,496,3844,496,'prod_TPgfLRLuabRgfy',1),('003d25b8-af27-4c8d-84c5-d5285d145282','Redburn',NULL,'Herman Melville','Fiction','http://books.google.com/books/content?id=LH87V-JOBSEC&printsec=frontcover&img=1&zoom=1&source=gbs_api','The hardships of life at sea and the realities of distant cities provide young Redburn with a startling introduction to the world',1976,3.61,448,522,448,'prod_TPgfvEy8SYrqoq',1),('00436794-d4d9-40d4-ae3f-c8cface40280','Selected Speeches and Writings',NULL,'Abraham Lincoln','History','http://books.google.com/books/content?id=7PuBQgAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api','Records Lincoln\'s campaigns for public office, the evolution of his stand against slavery, his debates with Stephen Douglas, and the great addresses of his presidency',1992,4.23,515,169,515,'prod_TPgfKY3D0a1LcI',1),('0049a3d4-02b8-44e3-96c7-cb00dde26210','Evolution and the Theory of Games',NULL,'John Maynard Smith','Science','http://books.google.com/books/content?id=Nag2IhmPS3gC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api','In this 1982 book, the theory of games, first developed to analyse economic behaviour, is modified so that it can be applied to evolving populations. John Maynard Smith\'s concept of an evolutionarily stable strategy is relevant whenever the best thing for an animal or plant to do depends on what others are doing. The theory leads to testable predictions about the evolution of behaviour, of sex and genetic systems, and of growth and life history patterns. This book contains a full account of the theory, and of the data relevant to it. The account is aimed at senior undergraduate and graduate students, teachers and research workers in animal behaviour, population genetics and evolutionary biology. The book will also be of interest to mathematicians and game theorists; the mathematics has been largely confined to appendixes so that the main text may be easily followed by biologists.',1982,4,234,80,234,'prod_TPgfu4m92SspSK',1),('0050eca2-d465-446c-8208-a2bff1e913cb','Anansi Boys',NULL,'Neil Gaiman','Fiction','http://books.google.com/books/content?id=VagoPwAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api','Fat Charlie Nancy\'s normal life ended the moment his father dropped dead on a Florida karaoke stage. Charlie didn\'t know his dad was a god. And he never knew he had a brother. Now brother Spider\'s on his doorstep—about to make Fat Charlie\'s life more interesting . . . and a lot more dangerous.',2006,4.02,387,153485,387,'prod_TPgfNHR55j59qE',1),('00522578-b62b-442d-92b8-84b7fd895ecb','The Last Days of Socrates',NULL,'Plato;Hugh Tredennick','Fiction','http://books.google.com/books/content?id=vwj_1haGR9wC&printsec=frontcover&img=1&zoom=1&source=gbs_api','Chronicling the life and death of the father of western philosophy, and charting his influence on the most influential ancient Greek philosophers, Plato\'s The Last Days of Socrates is translated from the Greek by Hugh Tredennick, revised with an introduction and notes by Harold Tarrant in Penguin Classics. The trial and condemnation of Socrates on charges of heresy and corrupting young minds is a defining moment in the history of Classical Athens. In tracing these events through four dialogues, Plato also developed his own philosophy, based on Socrates\' manifesto for a life guided by self-responsibility. Euthyphro finds Socrates outside the court-house, debating the nature of piety, while the Apology is his robust rebuttal of the charges of impiety and a defence of the philosopher\'s life. In the Crito, while awaiting execution in prison, Socrates counters the arguments of friends urging him to escape. Finally, in the Phaedo, he is shown calmly confident in the face of death, skilfully arguing the case for the immortality of the soul. Hugh Tredennick\'s landmark 1954 translation has been revised by Harold Tarrant, reflecting changes in Platonic studies, with an introduction and expanded introductions to each of the four dialogues. Plato (c.427-347 BC) stands with Socrates and Aristotle as one of the shapers of the whole intellectual tradition of the West. He founded the Academy in Athens, the first permanent institution devoted to philosophical research and teaching, and the prototype of all Western universities. If you enjoyed The Last Days of Socrates, you might like Plato\'s The Symposium, also available in Penguin Classics.',2003,4.07,256,1571,256,'prod_TPgfrKDUBldDtd',1),('0055ea7e-21a2-44d6-ac6d-f53a5b1e57f9','The Portable James Joyce',NULL,'James Joyce','Literary Collections','http://books.google.com/books/content?id=LSv3AKlD2OsC&printsec=frontcover&img=1&zoom=1&source=gbs_api','This compilation of the works of the Irish writer contains a variety of poems, stories and excerpts from novels',1985,4.16,762,624,762,'prod_TPgfS7XXHgVckd',1),('0059fd4f-4abf-485c-a818-2325520feaff','The Language Instinct','How the Mind Creates Language','Steven Pinker','Language Arts & Disciplines','http://books.google.com/books/content?id=NrXVUNbLaMUC&printsec=frontcover&img=1&zoom=1&source=gbs_api','In this classic study, the world\'s leading expert on language and the mind lucidly explains everything you always wanted to know about languages: how it works, how children learn it, how it changes, how the brain computes it, and how it envolved. With wit, erudition, and deft use it everyday examples of humor and wordplay, Steven Pinker weaves our vast knowledge of language into a compelling story: language is a human instinct, wired into our brains by evolution like web spinning in spiders or sonar bats. The Language Instinct received the William James Book Prize from the American Psychological Association and the Public Interest Award from the Linguistics Society of America.',2000,4.05,448,14293,448,'prod_TPgfOG9TmbuRdQ',1),('a4e7443b-117b-4ab9-9595-80eeacd02d5a','test',NULL,'test, test',NULL,'http://books.google.com/books/content?id=w2uMGXpNlzAC&printsec=frontcover&img=1&zoom=1&source=gbs_api','test',NULL,NULL,NULL,NULL,1234,NULL,1);
/*!40000 ALTER TABLE `books` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart`
--

DROP TABLE IF EXISTS `cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart` (
  `id` int NOT NULL AUTO_INCREMENT,
  `totalPrice` decimal(10,2) NOT NULL DEFAULT '0.00',
  `userId` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `REL_756f53ab9466eb52a52619ee01` (`userId`),
  KEY `IDX_756f53ab9466eb52a52619ee01` (`userId`),
  CONSTRAINT `FK_756f53ab9466eb52a52619ee019` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart`
--

LOCK TABLES `cart` WRITE;
/*!40000 ALTER TABLE `cart` DISABLE KEYS */;
INSERT INTO `cart` VALUES (3,0.00,'25e571a5-2868-4a03-86ac-9d4a46d7590d'),(4,0.00,'88029c02-bb03-4064-a83e-2345761f40a3'),(5,0.00,'a42653d8-09df-4369-b8b6-37b6666859df'),(6,0.00,'e5c95f40-8725-41d6-989a-f66d5924df10'),(7,0.00,'a4c100eb-0cee-44d5-861f-29b6c366dfd9'),(8,0.00,'d9671505-266f-4c2a-8d13-335d0c478ecc'),(9,0.00,'95e0ec58-2455-42c8-bb9c-e911a768648b'),(10,0.00,'f20f9271-fa73-4c34-842a-c2989e1a9000'),(11,0.00,'be23a1d0-a280-4201-8019-ac3c57abe9c6'),(12,0.00,'e10cbf61-aa68-4b64-8caa-e9cb840e514f');
/*!40000 ALTER TABLE `cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `quantity` int NOT NULL DEFAULT '1',
  `cartId` int DEFAULT NULL,
  `bookId` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_e932a0065f68f87535db463893` (`cartId`,`bookId`),
  KEY `FK_1091797c1c12f2523b1990bd941` (`bookId`),
  CONSTRAINT `FK_1091797c1c12f2523b1990bd941` FOREIGN KEY (`bookId`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_edd714311619a5ad09525045838` FOREIGN KEY (`cartId`) REFERENCES `cart` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=88 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES (68,2,5,'00436794-d4d9-40d4-ae3f-c8cface40280'),(71,1,10,'00436794-d4d9-40d4-ae3f-c8cface40280');
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` varchar(36) NOT NULL,
  `content` varchar(255) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `likes` int NOT NULL DEFAULT '0',
  `parentId` varchar(255) DEFAULT NULL,
  `bookId` varchar(36) DEFAULT NULL,
  `userId` varchar(36) DEFAULT NULL,
  `likeUsers` text,
  `sentiment` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_8770bd9030a3d13c5f79a7d2e81` (`parentId`),
  KEY `FK_fe496134857bf079aa6b55d68df` (`bookId`),
  KEY `FK_7e8d7c49f218ebb14314fdb3749` (`userId`),
  CONSTRAINT `FK_7e8d7c49f218ebb14314fdb3749` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_8770bd9030a3d13c5f79a7d2e81` FOREIGN KEY (`parentId`) REFERENCES `comments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_fe496134857bf079aa6b55d68df` FOREIGN KEY (`bookId`) REFERENCES `books` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES ('3305f729-f09b-4cee-bb75-e0630f2dac00','gggv','2025-11-13 12:50:44.225789',0,NULL,'00436794-d4d9-40d4-ae3f-c8cface40280','88029c02-bb03-4064-a83e-2345761f40a3','[]','negative');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventories`
--

DROP TABLE IF EXISTS `inventories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventories` (
  `id` varchar(36) NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventories`
--

LOCK TABLES `inventories` WRITE;
/*!40000 ALTER TABLE `inventories` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` varchar(36) NOT NULL,
  `userId` varchar(255) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `message` varchar(255) NOT NULL,
  `isRead` tinyint NOT NULL DEFAULT '0',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES ('1a96e4b5-9d9a-4b28-8376-bd483765d06d','d9671505-266f-4c2a-8d13-335d0c478ecc','Mã đơn hàng 06/11/2025(15:21:55) đã thanh toán thành công.Đơn hàng sẽ được giao đến bạn trong thời gian sớm nhất','Bạn đã thanh toán 344.00 USD thành công, đơn hàng sẽ được giao đến bạn trong thời gian sớm nhất',0,'2025-11-06 15:22:06.342325',NULL),('2f7d4e58-2cd8-4eaa-8795-8ae09c3973aa','88029c02-bb03-4064-a83e-2345761f40a3','Mã đơn hàng 13/11/2025(10:37)) đã thanh toán thành công.Đơn hàng sẽ được giao đến bạn trong thời gian sớm nhất','Bạn đã thanh toán 345.00 USD thành công, đơn hàng sẽ được giao đến bạn trong thời gian sớm nhất',0,'2025-11-13 10:38:01.814511',NULL),('94df7da3-eee0-4305-bfb9-d13a64ae0ef9','88029c02-bb03-4064-a83e-2345761f40a3','Đơn hàng của bạn đã được hoàn tiền thành công','Đơn hàng của bạn là đã được hoàn tiền',0,'2025-11-13 13:15:35.247821',NULL),('a03400fd-aca2-41d0-b172-65caf65f3585','88029c02-bb03-4064-a83e-2345761f40a3','Mã đơn hàng 07/11/2025(00:15:41) đã thanh toán thành công.Đơn hàng sẽ được giao đến bạn trong thời gian sớm nhất','Bạn đã thanh toán 690.00 USD thành công, đơn hàng sẽ được giao đến bạn trong thời gian sớm nhất',0,'2025-11-07 00:15:51.411519',NULL),('af017689-bfa7-433c-aca0-8b2d40ea4488','88029c02-bb03-4064-a83e-2345761f40a3','Mã đơn hàng 13/11/2025(13:02)) đã thanh toán thành công.Đơn hàng sẽ được giao đến bạn trong thời gian sớm nhất','Bạn đã thanh toán 898.00 USD thành công, đơn hàng sẽ được giao đến bạn trong thời gian sớm nhất',0,'2025-11-13 13:02:55.616508',NULL),('c3dd50ff-563b-425a-aba8-778d14981d65','dae99ad2-7687-44ff-b4a5-0d8e76bf611e','Mã đơn hàng 18/09/2025(15:02:27) đã thanh toán thành công.Đơn hàng sẽ được giao đến bạn trong thời gian sớm nhất','Bạn đã thanh toán 297.00 USD thành công, đơn hàng sẽ được giao đến bạn trong thời gian sớm nhất',0,'2025-09-18 15:02:50.856917',NULL),('d2f1a502-f862-4a8d-8f0a-b0427f94b171','d9671505-266f-4c2a-8d13-335d0c478ecc','Mã đơn hàng 06/11/2025(15:24:36) đã thanh toán thành công.Đơn hàng sẽ được giao đến bạn trong thời gian sớm nhất','Bạn đã thanh toán 358.00 USD thành công, đơn hàng sẽ được giao đến bạn trong thời gian sớm nhất',0,'2025-11-06 15:24:46.510887',NULL),('d6a939aa-8324-43bc-800f-d9707dee1fa3','d9671505-266f-4c2a-8d13-335d0c478ecc','Mã đơn hàng 06/11/2025(15:23:28) đã thanh toán thành công.Đơn hàng sẽ được giao đến bạn trong thời gian sớm nhất','Bạn đã thanh toán 298.00 USD thành công, đơn hàng sẽ được giao đến bạn trong thời gian sớm nhất',0,'2025-11-06 15:23:51.568874',NULL),('dfdc1034-edff-495b-920d-3200cd227342','88029c02-bb03-4064-a83e-2345761f40a3','Đơn hàng của bạn đã được hoàn tiền thành công','Đơn hàng của bạn là đã được hoàn tiền',0,'2025-11-07 00:18:18.658300',NULL),('fa2144cf-5ed7-4989-8c64-24a5b6d8e8ed','88029c02-bb03-4064-a83e-2345761f40a3','Mã đơn hàng 13/11/2025(10:39)) đã thanh toán thành công.Đơn hàng sẽ được giao đến bạn trong thời gian sớm nhất','Bạn đã thanh toán 345.00 USD thành công, đơn hàng sẽ được giao đến bạn trong thời gian sớm nhất',0,'2025-11-13 10:39:43.402017',NULL),('fbf2a190-6aa1-427d-866e-add2e96ccc63','d9671505-266f-4c2a-8d13-335d0c478ecc','Mã đơn hàng 06/11/2025(14:44:24) đã thanh toán thành công.Đơn hàng sẽ được giao đến bạn trong thời gian sớm nhất','Bạn đã thanh toán 298.00 USD thành công, đơn hàng sẽ được giao đến bạn trong thời gian sớm nhất',0,'2025-11-06 14:44:41.523798',NULL),('fe5afe55-9952-4a79-875c-9ce6388385e7','d9671505-266f-4c2a-8d13-335d0c478ecc','Mã đơn hàng 06/11/2025(14:58:58) đã thanh toán thành công.Đơn hàng sẽ được giao đến bạn trong thời gian sớm nhất','Bạn đã thanh toán 297.00 USD thành công, đơn hàng sẽ được giao đến bạn trong thời gian sớm nhất',0,'2025-11-06 14:59:26.145503',NULL),('ff1c4549-4f03-4c47-a605-d36205ef6920','88029c02-bb03-4064-a83e-2345761f40a3','Mã đơn hàng 07/11/2025(00:16:56) đã thanh toán thành công.Đơn hàng sẽ được giao đến bạn trong thời gian sớm nhất','Bạn đã thanh toán 1074.00 USD thành công, đơn hàng sẽ được giao đến bạn trong thời gian sớm nhất',0,'2025-11-07 00:17:06.686828',NULL),('ffa803b5-0d50-4092-b8b3-21a3019b91bb','d9671505-266f-4c2a-8d13-335d0c478ecc','Mã đơn hàng 06/11/2025(15:33:18) đã thanh toán thành công.Đơn hàng sẽ được giao đến bạn trong thời gian sớm nhất','Bạn đã thanh toán 1013.00 USD thành công, đơn hàng sẽ được giao đến bạn trong thời gian sớm nhất',0,'2025-11-06 15:35:15.678125',NULL);
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` varchar(36) NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `totalAmount` float NOT NULL,
  `stripePaymentId` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'paid',
  `orderStatus` varchar(255) NOT NULL DEFAULT 'processing',
  `paymentIntentId` varchar(255) DEFAULT NULL,
  `refundReason` varchar(255) DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES ('207e1d70-b34a-499f-a4ac-539ed5343a59','lamquangkhoi2016@gmail.com',345,'pi_3SSrNoI4UMjzjqG30qPRyH7y','PENDING','processing',NULL,NULL,'2025-11-13 10:39:43.410000','2025-11-13 10:39:43.411243'),('33c5a739-fe6d-4b77-a7a1-f19a83207aaf','lamquangkhoi2016@gmail.com',898,'pi_3SStcOI4UMjzjqG309korwSB','refunded','processing',NULL,NULL,'2025-11-13 13:02:55.622000','2025-11-13 13:15:35.000000'),('42972caa-8de1-46f4-b4f5-c4c4e2532668','lamquangkhoi2016@gmail.com',690,'pi_3SQWmmI4UMjzjqG30cIpCfUl','PENDING','processing',NULL,NULL,'2025-11-07 00:15:51.411000','2025-11-07 00:15:51.424622'),('45fa5433-a2a3-4c58-a2fa-375bf673c0f8','khoi123@gmail.com',358,'pi_3SQOUpPJgMEbAPth27axTLTL','PENDING','processing',NULL,NULL,'2025-11-06 15:24:46.514000','2025-11-06 15:24:46.516043'),('6ed6dd52-2a46-4e54-8aca-b5d5eb644ec8','khoi123@gmail.com',344,'pi_3SQOSEPJgMEbAPth1dlUgvaQ','PENDING','processing',NULL,NULL,'2025-11-06 15:22:06.347000','2025-11-06 15:22:06.350984'),('863436e6-13ba-4c04-b116-985fdc4ff677','khoi123@gmail.com',297,'pi_3SQO6IPJgMEbAPth07M0nGSp','PENDING','processing',NULL,NULL,'2025-11-06 14:59:26.152000','2025-11-06 14:59:26.155061'),('a4a22994-d757-45d0-a934-4a744949abca','lamquangkhoi2016@gmail.com',1074,'pi_3SQWnzI4UMjzjqG308umQ9d3','refunded','processing',NULL,NULL,'2025-11-07 00:17:06.692000','2025-11-07 00:18:18.000000'),('aefc0afb-fe38-4ab9-ad61-be8705187fb6','khoi123@gmail.com',1013,'pi_3SQOexPJgMEbAPth2yrjC4Ty','PENDING','processing',NULL,NULL,'2025-11-06 15:35:15.685000','2025-11-06 15:35:15.693025'),('b7484070-d782-4ec9-baf1-07a8b52f3916','khoi123@gmail.com',298,'pi_3SQNs1PJgMEbAPth0PakTHhh','PENDING','processing',NULL,NULL,'2025-11-06 14:44:41.530000','2025-11-06 14:44:41.534862'),('cc7c4db5-6dd7-4d40-b522-44bb5dc18cd8','khoi123@gmail.com',298,'pi_3SQOTwPJgMEbAPth1Zj4BHYM','PENDING','processing',NULL,NULL,'2025-11-06 15:23:51.583000','2025-11-06 15:23:51.586642'),('f68a0a71-8f14-41e6-8101-eaa499444a1b','lamquangkhoi2016@gmail.com',345,'pi_3SSrMAI4UMjzjqG31ULLszoQ','PENDING','processing',NULL,NULL,'2025-11-13 10:38:01.820000','2025-11-13 10:38:01.821278');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` varchar(36) NOT NULL,
  `amount` int NOT NULL,
  `currency` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `stripePaymentId` varchar(255) DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `userId` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_d35cb3c13a18e1ea1705b2817b1` (`userId`),
  CONSTRAINT `FK_d35cb3c13a18e1ea1705b2817b1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES ('42c0486c-d540-4545-8b4b-a64b9bea6e2f',35800,'usd','paid','pi_3SQOUpPJgMEbAPth27axTLTL','2025-11-06 15:24:46.484656','d9671505-266f-4c2a-8d13-335d0c478ecc'),('4d0d56b8-1a1f-4fec-b828-874ab5fc76a4',107400,'usd','paid','pi_3SQWnzI4UMjzjqG308umQ9d3','2025-11-07 00:17:06.659030','88029c02-bb03-4064-a83e-2345761f40a3'),('551ecdf1-5851-48ac-addd-40e76c896a38',89800,'usd','paid','pi_3SStcOI4UMjzjqG309korwSB','2025-11-13 13:02:55.587718','88029c02-bb03-4064-a83e-2345761f40a3'),('8c394683-93d6-439e-8e28-a8cf0d138df9',29800,'usd','paid','pi_3SQOTwPJgMEbAPth1Zj4BHYM','2025-11-06 15:23:51.543864','d9671505-266f-4c2a-8d13-335d0c478ecc'),('8ee87d12-2d80-46c9-88a6-1c08e6a3f135',34400,'usd','paid','pi_3SQOSEPJgMEbAPth1dlUgvaQ','2025-11-06 15:22:06.318136','d9671505-266f-4c2a-8d13-335d0c478ecc'),('a4345865-c305-4f13-b391-c6a49fd93250',29800,'usd','paid','pi_3SQNs1PJgMEbAPth0PakTHhh','2025-11-06 14:44:41.474078','d9671505-266f-4c2a-8d13-335d0c478ecc'),('a7de5eb2-08aa-46bd-b2c9-ac12935eff6e',34500,'usd','paid','pi_3SSrNoI4UMjzjqG30qPRyH7y','2025-11-13 10:39:43.380292','88029c02-bb03-4064-a83e-2345761f40a3'),('d1d98c8e-3b12-43f7-8e79-614906686da2',101300,'usd','paid','pi_3SQOexPJgMEbAPth2yrjC4Ty','2025-11-06 15:35:15.570055','d9671505-266f-4c2a-8d13-335d0c478ecc'),('e7550081-3f0b-42c1-85f0-d1dd68f41132',34500,'usd','paid','pi_3SSrMAI4UMjzjqG31ULLszoQ','2025-11-13 10:38:01.788778','88029c02-bb03-4064-a83e-2345761f40a3'),('e7a6b5f9-5654-4333-984c-1f4dff41f7d2',29700,'usd','paid','pi_3SQO6IPJgMEbAPth07M0nGSp','2025-11-06 14:59:26.108360','d9671505-266f-4c2a-8d13-335d0c478ecc'),('ef50d48f-bb74-468d-839b-916722e80e4f',69000,'usd','paid','pi_3SQWmmI4UMjzjqG30cIpCfUl','2025-11-07 00:15:51.302762','88029c02-bb03-4064-a83e-2345761f40a3');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `id` varchar(36) NOT NULL,
  `token` text NOT NULL,
  `expiryDate` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `search_history`
--

DROP TABLE IF EXISTS `search_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `search_history` (
  `id` varchar(36) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `searchTerm` varchar(255) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `search_history`
--

LOCK TABLES `search_history` WRITE;
/*!40000 ALTER TABLE `search_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `search_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` varchar(36) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'user',
  `avatarUrl` varchar(255) DEFAULT NULL,
  `refreshTokens` varchar(255) DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `address` varchar(255) NOT NULL DEFAULT 'Unknown',
  `firstName` varchar(255) DEFAULT NULL,
  `lastName` varchar(255) DEFAULT NULL,
  `dateOfBirth` varchar(255) DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_78a916df40e02a9deb1c4b75ed` (`username`),
  UNIQUE KEY `IDX_e12875dfb3b1d92d7d7c5377e2` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('25e571a5-2868-4a03-86ac-9d4a46d7590d','109549184684963857113','$2b$10$hQgkpUKryQW.1x4n3lF3Ou9k/XbqWM/CsRKoDKo.iVd4tEDLiFx9W','nguyenhuynhphuongloc@gmail.com','user',NULL,'','Active','Unknown',NULL,NULL,NULL,NULL),('88029c02-bb03-4064-a83e-2345761f40a3','103020144295372366940','$2b$10$rCyNYdDtXTvQ05u2a6GjfeZdw4masue5SUrZDHGoNBvRvzZDlAApW','lamquangkhoi2016@gmail.com','user',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMDMwMjAxNDQyOTUzNzIzNjY5NDAiLCJpYXQiOjE3NTkyOTkwMjgsImV4cCI6MTc1OTM4NTQyOH0.ug4i_XeXVrCUmpkFwPZnUaUINAVzxAcyhoMKQlBwQb0','Active','Unknown',NULL,NULL,NULL,NULL),('95e0ec58-2455-42c8-bb9c-e911a768648b','4321','$2b$10$9WIlgOO1KkW6CShd2ek8QOtotOorfoPqMkY3rzVEDYBuN.gTheiLi','4321@gmail.com','user',NULL,'$argon2id$v=19$m=65536,t=3,p=4$yIu1YTX/uu+YKCGRktvpdQ$PbGpH3yfX2FdnxAfxBcrG6Pel9LKyOIlId/U6HjLUsA','Active','Unknown',NULL,NULL,NULL,NULL),('a42653d8-09df-4369-b8b6-37b6666859df','123','$2b$10$bVUxgBiKdzEXTZDx2Y956.i2BBSVFf2enxmDSmBBACkUh5gUv2Ey.','123@gmail.com','user',NULL,'$argon2id$v=19$m=65536,t=3,p=4$Spn85w7OfQbcFoKwOIstWQ$926NTqoPs4JWA3Br04AiWu+SGOYGL6jTmLKPsXQgzo0','Active','Unknown',NULL,NULL,NULL,NULL),('a4c100eb-0cee-44d5-861f-29b6c366dfd9','khoi2','$2b$10$VGKMNQGROeIQdTneKRlWdeDWGtYpR9Z4/2GthjkRm2cisx6OrkM5u','khoi2@gmail.com','user',NULL,NULL,'Active','Unknown',NULL,NULL,NULL,NULL),('be23a1d0-a280-4201-8019-ac3c57abe9c6','khoi222','$2b$10$61Th0Jj1nATc/GujnyJRpuTsMNYT.j6ZQfjoAsT1CiA7VjdWgOpM6','khoi222@gmail.com','user',NULL,'$argon2id$v=19$m=65536,t=3,p=4$wR5i3FMy4x499Avz3UE9Jw$JHckG42eRoxb+WXD4gDsgRKmDHz9EhPyYzYypU2Pnoc','Active','Unknown',NULL,NULL,NULL,NULL),('d9671505-266f-4c2a-8d13-335d0c478ecc','khoi123','$2b$10$Lua91DQl7Gwkbj/wK0YgVePUjldlwHupOZiHcWRoV/TnitTW7l5x2','khoi123@gmail.com','user',NULL,'$argon2id$v=19$m=65536,t=3,p=4$jBbus+je1wmIicWTGatiYg$B6lbmh1kCE9v0igO29e63brLWcU+5T45/xVmj8NgJGk','Active','Unknown',NULL,NULL,NULL,NULL),('e10cbf61-aa68-4b64-8caa-e9cb840e514f','khoi12345','$2b$10$TKKFH0DoEklCKoCx6xPAxuvjqeD2VqZNu73BwttdIDVHzPbuXaLTu','khoi12345@gmail.com','user',NULL,'$argon2id$v=19$m=65536,t=3,p=4$Z6Zx0gy53mA0++JF0X1BOQ$tJtIDTjd1xU1J5AN6/EBbx2DwuOQfwYJBsZdEKoTZhg','Active','Unknown',NULL,NULL,NULL,NULL),('e5c95f40-8725-41d6-989a-f66d5924df10','234','$2b$10$.4hZCVSdfAR//3Ku7zZgBOv40ut6pWsnLjNQLUxeIgnsbW8GS5IDi','234@gmail.com','user',NULL,NULL,'Active','Unknown',NULL,NULL,NULL,NULL),('f20f9271-fa73-4c34-842a-c2989e1a9000','khoi111','$2b$10$yWxyWLplgYBREBEvkWRuCuh/Pr.tDRHl1VW1PUxabghyt0bEuxRIm','khoi1111@gmail.com','user',NULL,'$argon2id$v=19$m=65536,t=3,p=4$WpJ6Od0dPrKUR+AwJR0ewg$tnlHPoljpDLdRNwdkuvr+BaBJLHvY38CVgXvi69+wc4','Active','Unknown',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-13 15:27:33
