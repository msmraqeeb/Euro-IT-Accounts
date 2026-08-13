-- Euro IT Accounts Live Database Export (Exact Live Supabase Data)
-- Generated on 2026-08-13T04:32:13.084Z

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

-- Drop existing tables in child-to-parent order
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `expenses`;
DROP TABLE IF EXISTS `clients`;

-- Table structure for clients
CREATE TABLE IF NOT EXISTS `clients` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `company` VARCHAR(255) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `createdAt` BIGINT DEFAULT 0,
  `isActive` TINYINT(1) DEFAULT 1,
  `totalBilled` DECIMAL(12, 2) DEFAULT 0.00,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Live Data for clients (17 records)
INSERT INTO `clients` (`id`, `name`, `email`, `phone`, `company`, `notes`, `createdAt`, `isActive`, `totalBilled`) VALUES
('b5924b5b-17fc-4905-96af-544cb73cd4c3', 'Vocab Guru by Rakib', 'someone@email.com', '', '', '', 1764042223971, 0, 0),
('f9ad17b7-3d8e-4625-a564-468aee7736b1', 'Joota Footwear', 'jootafootwear23@gmail.com', '01929-110024', '', '', 1764044333932, 0, 0),
('539d41ca-1b83-4ac5-8fb5-8377875b9de9', 'Bagan Bari', 'properties.mirpur@gmail.com', '01617-392019', '', '', 1764048717576, 0, 10000),
('2acd2ffc-d4fc-4021-b1db-66004599702e', 'Xamly', 'xamlyofficial@gmail.com', '01568-268334', '', '', 1764044527404, 0, 15000),
('62c75262-7923-46d0-b149-ec4080d7a020', 'Euro IT', 'euroitofficial@gmail.com', '01339-844255', '', '4 Static\n2 Reels', 1763995898235, 0, 0),
('e2af59fc-0755-48c4-b0b3-46b3ab616309', 'Euro Marble', 'euromarblengraniteltd@gmail.com', '01789-105003', '', '4 Static\n2 Reels', 1763996196108, 0, 0),
('b1e3dc45-8b94-4599-97d4-30b909f380fa', 'ZNRF', 'admissions@zums.edu.bd', '01877-700205', '', 'Ad Run', 1764056720849, 0, 10000),
('db8df7f6-e0d3-458a-9c0f-698a9ba8e483', 'Rising Solutions', 'nahazglobal@gmail.com', '01841-699601', '', '', 1764062460817, 0, 42000),
('12625084-a571-429c-8aa0-008ad683e8b5', 'Elva International', 'elvainternational25@gmail.com', '01752-351823', '', '4 Static\n2 Reels', 1764062969432, 0, 21000),
('67fafd09-ec65-4550-aa5e-27dee01001b4', 'Red Data Ltd.', 'info@reddata.com.bd', '09640-123123', 'Red Data Ltd.', 'Content Creation', 1771738873537, 1, 20000),
('bb1ec706-c2fc-48e1-bf12-a06a95da7bb2', 'Priority Real Estate', 'priorityrealestateltd@gmail.com', '01341-620065', '', '8 Static\n4 Reels', 1764047904004, 1, 15000),
('97428ab7-682e-48da-96da-dfeb89fa13db', 'Desh Chemical', 'none@email.com', '01690-230576', '', 'ERP Solution', 1764472193848, 0, 46000),
('2be550c9-0702-4d10-9f79-49dc18b6b8a5', 'Classic Salon', 'info@classiccutboutiquesalon.com', '01614-053330', '', '8 Static\n4 Reels', 1764063059119, 0, 21000),
('0f26ff7e-7131-4638-8c0c-0d0a958ddd67', 'One Flower', 'oneflower.ae@gmail.com', '', '', 'Website Maintenance\nSocial Media Service', 1764062542385, 0, 37540),
('8ac9d376-ace5-40db-b3e1-9d606cdb484f', 'Angoshaj', 'sumaiya_liza@yahoo.com', '01406-197260', '', 'Ad Run', 1764062632825, 0, 7500),
('0e09b4a7-43a3-4a36-85f0-ac5e2095419b', 'Mehek', 'mehek@email.com', '01307-692308', 'Mehek', 'Digital Advertisement March 15k\nDigital Advertisement May 15k', 1771224515835, 1, 30000),
('24043b90-909a-4dbd-be2b-214869b57e0e', 'Sakib Sir', 'info@regnum.com.bd', '', 'Regnum IT', '', 1781497986263, 1, 50000);

-- Table structure for expenses
CREATE TABLE IF NOT EXISTS `expenses` (
  `id` VARCHAR(36) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `date` DATE NOT NULL,
  `description` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Live Data for expenses (42 records)
INSERT INTO `expenses` (`id`, `category`, `amount`, `date`, `description`) VALUES
('f60428b5-b4be-45d5-a13c-5237950c5733', 'Visiting Card', 1000, '2025-11-18', 'Visiting Card Advance'),
('475f8547-ab0d-4a0f-9a11-3b865419c150', 'Mobile Recharge', 300, '2025-11-20', 'Alvi Office Mobile Recharge'),
('7b820663-dd4d-4edc-916d-761cc50b27cf', 'Conveyance', 360, '2025-11-24', 'Mr. Rafi''s frnd conveyance Classic Salon'),
('699b2281-069b-4c3a-a313-4b61aa032b01', 'Freelancer Payment', 9400, '2025-12-06', 'Jubair Video Editor Payment'),
('94fd6bbe-7f69-4ab8-a60a-0106f7d288c4', 'Freelancer Payment', 10400, '2025-12-11', 'Mahadi Graphics Design (Oct - Nov)'),
('2c684291-35a3-49b6-87f9-2e261f8bc603', 'Office purpose', 400, '2025-12-27', 'Candidate Lunch'),
('ce9c4848-0215-4136-98ad-a4fcc6f46e96', 'Video Shoot', 6000, '2025-12-11', 'Video Shoot of Priority'),
('235a04bc-e136-4caf-a60c-8ab1f3ec2fde', 'Video Shoot', 4000, '2025-11-17', 'Video Shoot of Priority'),
('46025d62-d98d-469e-95a0-ef470f0292d4', 'Video Shoot', 5000, '2026-01-19', 'Video Shoot of Priority'),
('f59ab1c1-05a0-4086-a675-b21666b93f18', 'Mobile Recharge', 200, '2026-01-14', 'Alvi Office Mobile Recharge'),
('8443ed9f-774a-41c2-b4ab-60e53cfee2b4', 'Office purpose', 1200, '2026-02-28', 'CapCut Renew'),
('86313a8e-ef0a-419e-a438-dca4541a7fc9', 'Office purpose', 250, '2026-01-11', 'CapCut Purchase'),
('169a56bb-a2b0-4285-bd23-919cbab491de', 'Advertisement', 12400, '2026-03-10', 'Mehek Advertising'),
('3b8f22bd-07ef-4702-8612-2c1e348bd409', 'Office purpose', 1200, '2026-03-11', 'CapCut Renew March 2026'),
('423fd34c-0e01-42de-97cf-603cb83adb46', 'Office purpose', 1200, '2026-04-15', 'CapCut Renew April 2026'),
('ea28c19e-f1f3-4fbb-b533-07cda9a8ca8a', 'Video Shoot', 3000, '2026-05-17', 'Videographar Kavi for Priority Video Shoot'),
('8ecae3c8-38a9-4516-8003-994b54241f5b', 'Video Shoot', 3000, '2026-05-17', 'Video person for Priority'),
('abd9be02-5985-4125-bded-79f6dcde7b4a', 'Office purpose', 1200, '2026-05-12', 'CapCut Renew May 2026'),
('10fca747-329f-4da9-90fd-3f2dc0ae8e0c', 'Office purpose', 1200, '2026-06-13', 'CapCut Renew June 2026'),
('fdefda24-51fa-4363-afe7-d6dab16de25c', 'Visiting Card', 2950, '2025-12-01', 'Visiting + ID Card'),
('2bf4ad9b-a72d-4734-b862-b632c787d26b', 'Freelancer Payment', 9500, '2025-12-04', 'Jubair Video Editor'),
('906861ce-a745-4854-952f-400de485675a', 'Freelancer Payment', 10400, '2025-12-11', 'Graphics Design'),
('5a609a9d-0956-40e6-8016-218cd4cd399c', 'Video Shoot', 6000, '2025-12-11', 'Video Shooting'),
('9a880949-7680-4374-a3c1-e7d3e60cb9b0', 'Freelancer Payment', 5000, '2025-12-14', 'Kavi Video Editing'),
('542a2320-16db-423d-9e10-2229c72f9c08', 'Freelancer Payment', 8000, '2026-01-05', 'Jubair Video Editor'),
('5537faaf-75fc-4c87-809f-7bbf66a5c1d1', 'Office purpose', 1200, '2026-07-12', 'CapCut Renew July 2026'),
('a2ca5faf-3dc0-41c0-ac04-5c384cb34731', 'Salary', 25000, '2025-12-14', 'IT Advance'),
('98c9a755-32ba-4bbe-91ce-f6861b6ca915', 'Salary', 39770, '2025-12-21', 'Salary'),
('076c6925-ba16-48c3-8900-1e78d08c63d1', 'Office purpose', 2843, '2026-01-11', 'Bdjobs'),
('1f0ca173-5013-440a-9593-6c3d3d5c9108', 'Salary', 61300, '2026-01-20', 'Salary December'),
('1bc8ad5e-e3fd-411e-84e5-b350282348c2', 'Conveyance', 570, '2026-01-20', 'Client Visit'),
('afb70301-d56f-4d3e-ad60-46f30214f8c2', 'Office purpose', 1000, '2026-01-20', 'Client entertainment'),
('dffea4b7-d404-43f0-992a-81b7afa0aa27', 'Conveyance', 200, '2026-01-31', 'Rafi conveyance'),
('7c24b486-0df2-493f-b8e6-91d8b99e0d26', 'Conveyance', 800, '2026-02-15', 'Client Visit'),
('dc2c21b4-25f9-425c-a66c-055e1ea51de0', 'Conveyance', 500, '2026-02-26', 'Client Visit'),
('dd9d443b-f7ea-4dd8-9063-aa2c9d19705f', 'Freelancer Payment', 7000, '2026-03-01', 'Freelancer payment'),
('a1cd42cb-a8d3-4746-80f0-37e382acbca6', 'Conveyance', 300, '2026-03-15', 'Client Visit Rafi'),
('8334d437-bc2c-4384-801e-673d940b9dc2', 'Salary', 53835, '2026-04-19', 'Salary March'),
('44dcc4b3-1ada-49c2-814e-dff8c4d56dee', 'Salary', 92869, '2026-05-24', 'Salary+Bonus 4 person'),
('b8dc68be-40f1-484c-b67e-2dbda9b48894', 'Office purpose', 1830, '2026-06-14', 'Entertainment'),
('0037b5a8-bdd5-413d-9725-57f8c220ea70', 'Salary', 30000, '2026-06-20', 'Salary'),
('9b771bff-74d5-4557-9fbf-5bc921ccb824', 'Salary', 10000, '2026-06-22', 'Salary');

-- Table structure for payments
CREATE TABLE IF NOT EXISTS `payments` (
  `id` VARCHAR(36) NOT NULL,
  `clientId` VARCHAR(36) NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `date` DATE NOT NULL,
  `description` TEXT DEFAULT NULL,
  `method` VARCHAR(50) DEFAULT 'Bank Transfer',
  `details` TEXT DEFAULT NULL,
  `type` VARCHAR(20) DEFAULT 'RECEIVED',
  PRIMARY KEY (`id`),
  KEY `idx_clientId` (`clientId`),
  CONSTRAINT `fk_payments_client` FOREIGN KEY (`clientId`) REFERENCES `clients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Live Data for payments (37 records)
INSERT INTO `payments` (`id`, `clientId`, `amount`, `date`, `description`, `method`, `details`, `type`) VALUES
('22a3765a-5626-466c-802a-e2c94ee93ae8', 'b5924b5b-17fc-4905-96af-544cb73cd4c3', 4500, '2025-07-01', '', 'Mobile Banking', 'Anis Sir', 'RECEIVED'),
('e980aafa-0d6d-419a-a249-e4aeca0c2360', 'f9ad17b7-3d8e-4625-a564-468aee7736b1', 2000, '2025-07-29', 'Payment', 'Other', 'Nagad, Zakir Sir', 'RECEIVED'),
('2eb32b51-7e64-46ff-b80b-9b12d01e2231', '539d41ca-1b83-4ac5-8fb5-8377875b9de9', 2000, '2025-08-12', 'Payment', 'Cash', 'Anis Sir', 'RECEIVED'),
('36e2c7a4-e5ad-40e9-b26d-72fdf3378cb9', '539d41ca-1b83-4ac5-8fb5-8377875b9de9', 3000, '2025-08-20', 'Payment', 'bKash', 'Anis Sir', 'RECEIVED'),
('16b01c7e-d506-45c1-836d-4b76071396ee', '2acd2ffc-d4fc-4021-b1db-66004599702e', 8000, '2025-08-04', 'Payment', 'bKash', 'Anis Sir', 'RECEIVED'),
('f8cb1f19-442a-41a9-89e3-38996bc3ad99', '2acd2ffc-d4fc-4021-b1db-66004599702e', 8000, '2025-08-31', 'Payment', 'bKash', '', 'REFUND'),
('a5d08177-ee55-490d-9743-17570af4ea5b', 'bb1ec706-c2fc-48e1-bf12-a06a95da7bb2', 20000, '2025-08-04', 'Payment for Aug & Sep', 'bKash', 'Anis Sir', 'RECEIVED'),
('9ad2bfa4-05d1-4268-8a68-a3988e05da98', 'b1e3dc45-8b94-4599-97d4-30b909f380fa', 10000, '2025-09-07', 'Payment', 'bKash', 'Anis Sir', 'RECEIVED'),
('9b9a296f-4773-4cee-827c-0933e3fe9026', '0f26ff7e-7131-4638-8c0c-0d0a958ddd67', 6000, '2025-09-18', 'Aug, Sep, Oct', 'bKash', 'Anis Sir', 'RECEIVED'),
('326d5d0c-1e48-41c9-82f3-e2a30f72552b', '8ac9d376-ace5-40db-b3e1-9d606cdb484f', 1000, '2025-09-23', 'Payment', 'Cash', 'Anis Sir', 'RECEIVED'),
('0cb57a87-ffd2-4d65-bf88-e074d3991900', '8ac9d376-ace5-40db-b3e1-9d606cdb484f', 2750, '2025-09-22', 'Payment', 'Bank Transfer', '', 'RECEIVED'),
('a8ee57e4-d08f-42f7-9885-75db42d78555', '12625084-a571-429c-8aa0-008ad683e8b5', 5000, '2025-10-08', 'Payment', 'bKash', 'Anis Sir', 'RECEIVED'),
('9963b2c8-9711-4987-ae9b-0887a44b9232', '2be550c9-0702-4d10-9f79-49dc18b6b8a5', 5000, '2025-10-13', 'Payment', 'Bank Transfer', '', 'RECEIVED'),
('6bf9f2e0-3c44-4418-a109-090712cbef49', '0f26ff7e-7131-4638-8c0c-0d0a958ddd67', 4000, '2025-11-23', 'Nov & Dec 2025', 'bKash', 'Website maintenance charge', 'RECEIVED'),
('2c044036-96e1-427b-9921-6419df73b917', '8ac9d376-ace5-40db-b3e1-9d606cdb484f', 3750, '2025-11-27', 'Payment', 'Bank Transfer', 'USB', 'RECEIVED'),
('ed7fe995-77d9-486f-9416-8338400d43e7', '97428ab7-682e-48da-96da-dfeb89fa13db', 10000, '2025-11-29', 'Advance', 'Bank Transfer', 'UCB Bank Transfer', 'RECEIVED'),
('b9a6bacc-62fa-44c4-93c3-c0b16072e5d6', 'bb1ec706-c2fc-48e1-bf12-a06a95da7bb2', 15000, '2025-08-14', 'For Advertisement', 'bKash', 'Anis Sir', 'RECEIVED'),
('e9fd2712-ef78-460b-a298-b8464d490474', 'bb1ec706-c2fc-48e1-bf12-a06a95da7bb2', 30000, '2025-10-19', 'Content & Ad', 'Bank Transfer', '', 'RECEIVED'),
('1d8d3863-6275-419f-85a9-4721dd1dbaad', '12625084-a571-429c-8aa0-008ad683e8b5', 5000, '2025-10-04', 'Payment', 'Cash', 'Zakir Sir', 'RECEIVED'),
('383da60d-6618-4cb9-8742-43d1aa0c9f4a', '12625084-a571-429c-8aa0-008ad683e8b5', 11000, '2025-12-01', 'Due Clearance', 'Cash', 'Anis Sir', 'RECEIVED'),
('b8e6854a-afb0-4b94-a8bc-c116047ef8c3', '0f26ff7e-7131-4638-8c0c-0d0a958ddd67', 27010, '2025-12-08', 'Social Media Service', 'bKash', 'Anis Sir', 'RECEIVED'),
('d6a53c05-b370-45c1-8692-5fcd8e37f9e1', 'db8df7f6-e0d3-458a-9c0f-698a9ba8e483', 3000, '2025-09-16', 'Advance', 'bKash', 'Anis Sir', 'RECEIVED'),
('89b1d71a-5990-4316-9b55-7b483dbfc334', '2be550c9-0702-4d10-9f79-49dc18b6b8a5', 7000, '2025-11-18', 'Payment', 'Cash', 'Anis Sir', 'RECEIVED'),
('2f595cd0-9286-48ad-842d-cbe044fc1cd3', 'bb1ec706-c2fc-48e1-bf12-a06a95da7bb2', 30000, '2025-11-25', 'Content and Video Shooting', 'Bank Transfer', 'Content 15k, Video Shooting 15k', 'RECEIVED'),
('f79a82ea-9456-4723-a3d5-cd9b5038d0d2', 'bb1ec706-c2fc-48e1-bf12-a06a95da7bb2', 35000, '2026-01-06', 'Content & Video Shooting', 'Bank Transfer', 'Content 15k, Video Shooting 20k', 'RECEIVED'),
('4921be33-4993-439d-9f19-37916a52bde4', '0e09b4a7-43a3-4a36-85f0-ac5e2095419b', 8000, '2026-02-16', 'Advance', 'Cash', 'Director Sir received', 'RECEIVED'),
('ec580c65-91b5-4d25-b2b4-7fb999694b34', '0e09b4a7-43a3-4a36-85f0-ac5e2095419b', 7000, '2026-03-10', 'To Director Sir', 'Cash', 'Rest payment', 'RECEIVED'),
('ee138971-af1b-48d9-93cb-f505afb60683', '2be550c9-0702-4d10-9f79-49dc18b6b8a5', 9000, '2026-02-18', 'Mr. Anis', 'bKash', 'Rest Payment', 'RECEIVED'),
('4a198eb8-2f24-43b5-8f66-165a26443e54', '67fafd09-ec65-4550-aa5e-27dee01001b4', 10000, '2026-03-30', 'Rest 50% of March 2026', 'Bank Transfer', 'Payable Cheque for Euro Marble Account', 'RECEIVED'),
('4a90b005-1c0d-43d0-9768-a5ba67df80d9', '67fafd09-ec65-4550-aa5e-27dee01001b4', 10000, '2026-02-16', '50% advance of March 2026', 'Cheque', 'Accounts Pay to EMG', 'RECEIVED'),
('61ba1062-6183-4f65-b397-e095ae215a90', '67fafd09-ec65-4550-aa5e-27dee01001b4', 10000, '2026-04-19', '50% of April 2026', 'Bank Transfer', 'Payable Cheque for Euro Marble Account', 'RECEIVED'),
('3335bdd4-1972-4018-9e45-9b24ed66b8c2', 'bb1ec706-c2fc-48e1-bf12-a06a95da7bb2', 50000, '2026-04-19', 'Due 44,100/-', 'Bank Transfer', 'Bank Transfer to EMG UCB Bank', 'RECEIVED'),
('65a04f80-32b5-4682-a648-ffeba898f612', '0e09b4a7-43a3-4a36-85f0-ac5e2095419b', 7000, '2026-05-16', 'Paid to Mr. Anis of Euro Marble', 'Cash', 'Due 8000', 'RECEIVED'),
('bc0c89a7-1551-431b-8733-2b731ce9601c', '67fafd09-ec65-4550-aa5e-27dee01001b4', 10000, '2026-05-17', 'Rest 50% of April 2026', 'Bank Transfer', 'Payable Cheque for Euro Marble Account', 'RECEIVED'),
('3e4daa23-8353-4d17-ade2-f334d2ad5277', '24043b90-909a-4dbd-be2b-214869b57e0e', 50000, '2026-06-14', 'June Month Payment', 'Bank Transfer', '15 June - 14 July', 'RECEIVED'),
('3b683ea6-a1ce-47b0-b4e8-69ba8f3657d9', '0e09b4a7-43a3-4a36-85f0-ac5e2095419b', 8000, '2026-06-27', 'Received by Director Sir', 'Cash', 'Rest Payment of Project', 'RECEIVED'),
('fb0f56b1-6b29-4873-83a4-4702b4247d8d', '67fafd09-ec65-4550-aa5e-27dee01001b4', 10000, '2026-07-14', 'Payment', 'Cash', 'Rest Payment of June Month', 'RECEIVED');

SET FOREIGN_KEY_CHECKS = 1;
