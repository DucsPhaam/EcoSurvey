-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: ecosurvey
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `ecosurvey`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `ecosurvey` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `ecosurvey`;

--
-- Table structure for table `faqs`
--

DROP TABLE IF EXISTS `faqs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faqs` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `question` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `answer` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  FULLTEXT KEY `idx_faqs_ft` (`question`,`answer`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faqs`
--

LOCK TABLES `faqs` WRITE;
/*!40000 ALTER TABLE `faqs` DISABLE KEYS */;
INSERT INTO `faqs` VALUES (1,'Làm thế nào để tham gia khảo sát?','Sau khi đăng nhập, vào mục \"Bảng Khảo Sát\", chọn khảo sát bạn muốn tham gia và nhấn nút \"Tham Gia Ngay\". Điền đầy đủ các câu hỏi và nhấn \"Nộp Bài\".','Khảo sát',1,'2026-07-06 19:15:15','2026-07-06 19:15:15'),(2,'Điểm được tính như thế nào?','Mỗi lần hoàn thành khảo sát bạn nhận được 10 điểm. Mỗi báo cáo Tham Gia Hiệu Quả (Effective Participation) được Admin duyệt sẽ cộng thêm 50 điểm.','Điểm số',1,'2026-07-06 19:15:15','2026-07-06 19:15:15'),(3,'Tôi có thể nộp báo cáo hoạt động ngoại khóa không?','Có! Vào mục \"Báo Cáo Hoạt Động\", điền thông tin sự kiện, mô tả chi tiết và đính kèm tối đa 5 file minh chứng (ảnh/PDF, mỗi file ≤ 5MB). Admin sẽ xem xét và duyệt trong thời gian sớm nhất.','Hoạt động',1,'2026-07-06 19:15:15','2026-07-06 19:15:15'),(4,'Tài khoản của tôi đang ở trạng thái chờ duyệt là sao?','Sau khi đăng ký, tài khoản cần được Admin phê duyệt trước khi sử dụng. Bạn sẽ nhận được thông báo khi tài khoản được duyệt hoặc bị từ chối. Thời gian duyệt thường trong vòng 1-2 ngày làm việc.','Tài khoản',1,'2026-07-06 19:15:15','2026-07-06 19:15:15'),(5,'Làm sao để xem bảng xếp hạng?','Vào mục \"Bảng Xếp Hạng\" trên thanh điều hướng. Bạn có thể xem top 10 theo tuần, tháng hoặc toàn thời gian. Vị trí của bạn sẽ được hiển thị ngay cả khi không nằm trong top 10.','Xếp hạng',1,'2026-07-06 19:15:15','2026-07-06 19:15:15'),(6,'Tôi quên mật khẩu thì phải làm sao?','Hiện tại vui lòng liên hệ Admin để được hỗ trợ đặt lại mật khẩu. Tính năng tự khôi phục mật khẩu qua email đang được phát triển.','Tài khoản',1,'2026-07-06 19:15:15','2026-07-06 19:15:15'),(7,'Khảo sát có thể nộp lại không?','Không. Mỗi khảo sát chỉ được nộp bài một lần. Sau khi đã nộp, bạn sẽ thấy nhãn \"Đã Hoàn Thành\" và không thể tham gia lại khảo sát đó.','Khảo sát',1,'2026-07-06 19:15:15','2026-07-06 19:15:15'),(8,'Làm thế nào để tham gia khảo sát?','Sau khi đăng nhập, vào mục \"Bảng Khảo Sát\", chọn khảo sát bạn muốn tham gia và nhấn nút \"Tham Gia Ngay\". Điền đầy đủ các câu hỏi và nhấn \"Nộp Bài\".','Khảo sát',1,'2026-07-06 20:17:35','2026-07-06 20:17:35'),(9,'Điểm được tính như thế nào?','Mỗi lần hoàn thành khảo sát bạn nhận được 10 điểm. Mỗi báo cáo Tham Gia Hiệu Quả (Effective Participation) được Admin duyệt sẽ cộng thêm 50 điểm.','Điểm số',1,'2026-07-06 20:17:35','2026-07-06 20:17:35'),(10,'Tôi có thể nộp báo cáo hoạt động ngoại khóa không?','Có! Vào mục \"Báo Cáo Hoạt Động\", điền thông tin sự kiện, mô tả chi tiết và đính kèm tối đa 5 file minh chứng (ảnh/PDF, mỗi file ≤ 5MB). Admin sẽ xem xét và duyệt trong thời gian sớm nhất.','Hoạt động',1,'2026-07-06 20:17:35','2026-07-06 20:17:35'),(11,'Tài khoản của tôi đang ở trạng thái chờ duyệt là sao?','Sau khi đăng ký, tài khoản cần được Admin phê duyệt trước khi sử dụng. Bạn sẽ nhận được thông báo khi tài khoản được duyệt hoặc bị từ chối. Thời gian duyệt thường trong vòng 1-2 ngày làm việc.','Tài khoản',1,'2026-07-06 20:17:35','2026-07-06 20:17:35'),(12,'Làm sao để xem bảng xếp hạng?','Vào mục \"Bảng Xếp Hạng\" trên thanh điều hướng. Bạn có thể xem top 10 theo tuần, tháng hoặc toàn thời gian. Vị trí của bạn sẽ được hiển thị ngay cả khi không nằm trong top 10.','Xếp hạng',1,'2026-07-06 20:17:35','2026-07-06 20:17:35'),(13,'Tôi quên mật khẩu thì phải làm sao?','Hiện tại vui lòng liên hệ Admin để được hỗ trợ đặt lại mật khẩu. Tính năng tự khôi phục mật khẩu qua email đang được phát triển.','Tài khoản',1,'2026-07-06 20:17:35','2026-07-06 20:17:35'),(14,'Khảo sát có thể nộp lại không?','Không. Mỗi khảo sát chỉ được nộp bài một lần. Sau khi đã nộp, bạn sẽ thấy nhãn \"Đã Hoàn Thành\" và không thể tham gia lại khảo sát đó.','Khảo sát',1,'2026-07-06 20:17:35','2026-07-06 20:17:35');
/*!40000 ALTER TABLE `faqs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `reference_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` int unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_notif_user_id` (`user_id`),
  KEY `idx_notif_is_read` (`is_read`),
  KEY `notifications_user_id` (`user_id`),
  KEY `notifications_is_read` (`is_read`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,2,'Báo cáo hoạt động được duyệt','Báo cáo \"Chiến dịch dọn rác bãi biển\" của bạn đã được Admin phê duyệt.',1,'participation',1,'2026-07-05 20:17:35'),(2,2,'Điểm thưởng mới!','Bạn vừa nhận được 50 điểm từ hoạt động \"Chiến dịch dọn rác bãi biển\".',0,'user',2,'2026-07-05 20:17:35'),(3,2,'Báo cáo hoạt động bị từ chối','Báo cáo \"Thu gom pin cũ\" của bạn đã bị từ chối. Lý do: Hình ảnh minh chứng quá mờ, không xác định được nội dung. Vui lòng chụp lại.',0,'participation',4,'2026-07-06 19:17:35'),(4,3,'Tài khoản đang chờ duyệt','Tài khoản của bạn đang được Admin xem xét. Vui lòng quay lại sau.',0,'user',3,'2026-07-01 20:17:35'),(5,4,'Tài khoản bị từ chối','Đăng ký tài khoản của bạn bị từ chối do: Hình ảnh thẻ sinh viên không hợp lệ. Vui lòng liên hệ Admin.',1,'user',4,'2026-07-03 20:17:35'),(6,5,'Khảo sát mới dành cho bạn','Khảo sát \"Giao thông Xanh đến Trường\" vừa được mở. Hãy tham gia ngay để nhận điểm thưởng!',1,'survey',5,'2026-07-05 20:17:35');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `participation_files`
--

DROP TABLE IF EXISTS `participation_files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `participation_files` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `participation_id` int unsigned NOT NULL,
  `file_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size` int unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pf_participation_id` (`participation_id`),
  KEY `participation_files_participation_id` (`participation_id`),
  CONSTRAINT `participation_files_ibfk_1` FOREIGN KEY (`participation_id`) REFERENCES `participations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `participation_files`
--

LOCK TABLES `participation_files` WRITE;
/*!40000 ALTER TABLE `participation_files` DISABLE KEYS */;
INSERT INTO `participation_files` VALUES (1,1,'https://example.com/uploads/don_rac_1.jpg','don_rac_1.jpg','image/jpeg',1024000,'2026-07-06 20:17:35'),(2,1,'https://example.com/uploads/don_rac_2.jpg','don_rac_2.jpg','image/jpeg',2048000,'2026-07-06 20:17:35'),(3,2,'https://example.com/uploads/toadam_checkin.png','toadam_checkin.png','image/png',512000,'2026-07-06 20:17:35'),(4,3,'https://example.com/uploads/trong_cay.jpg','trong_cay.jpg','image/jpeg',3072000,'2026-07-06 20:17:35'),(5,4,'https://example.com/uploads/pin_cu_mo.jpg','pin_cu_mo.jpg','image/jpeg',150000,'2026-07-06 20:17:35');
/*!40000 ALTER TABLE `participation_files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `participations`
--

DROP TABLE IF EXISTS `participations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `participations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `event_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `participant_count` int unsigned DEFAULT '0',
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('Pending','Approved','Rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'Pending',
  `ai_summary` text COLLATE utf8mb4_unicode_ci,
  `reject_reason` text COLLATE utf8mb4_unicode_ci,
  `reviewed_by` int unsigned DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_part_user_id` (`user_id`),
  KEY `idx_part_status` (`status`),
  KEY `reviewed_by` (`reviewed_by`),
  KEY `participations_user_id` (`user_id`),
  KEY `participations_status` (`status`),
  CONSTRAINT `participations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `participations_ibfk_2` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `participations`
--

LOCK TABLES `participations` WRITE;
/*!40000 ALTER TABLE `participations` DISABLE KEYS */;
INSERT INTO `participations` VALUES (1,2,'Chiến dịch dọn rác bãi biển','Bãi biển Đồ Sơn',50,'Tham gia nhặt rác nhựa dọc bờ biển cùng CLB Môi Trường trong 3 tiếng.','Approved',NULL,NULL,1,'2026-07-05 20:17:35','2026-07-04 20:17:35','2026-07-06 20:17:35'),(2,2,'Tọa đàm lối sống Zero Waste','Hội trường A',200,'Nghe diễn giả chia sẻ về lối sống không rác thải.','Pending',NULL,NULL,NULL,NULL,'2026-07-06 15:17:35','2026-07-06 20:17:35'),(3,5,'Trồng cây đầu xuân','Khuôn viên trường',30,'Trồng 50 cây xanh quanh khu vực nhà xe cán bộ.','Approved',NULL,NULL,1,'2026-06-26 20:17:35','2026-06-25 20:17:35','2026-07-06 20:17:35'),(4,2,'Thu gom pin cũ','Sảnh nhà C',0,'Gửi ảnh nộp pin cũ nhưng ảnh mờ, không rõ ràng.','Rejected',NULL,'Hình ảnh minh chứng quá mờ, không xác định được nội dung. Vui lòng chụp lại.',1,'2026-07-06 19:17:35','2026-07-06 17:17:35','2026-07-06 20:17:35');
/*!40000 ALTER TABLE `participations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_resets`
--

DROP TABLE IF EXISTS `password_resets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_resets` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `token_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_hash` (`token_hash`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `password_resets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_resets`
--

LOCK TABLES `password_resets` WRITE;
/*!40000 ALTER TABLE `password_resets` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_resets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `point_logs`
--

DROP TABLE IF EXISTS `point_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `point_logs` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `action_type` enum('Survey_Completion','Event_Report','Bonus','Deduction') COLLATE utf8mb4_unicode_ci NOT NULL,
  `points` int DEFAULT '0',
  `reference_id` int unsigned DEFAULT NULL,
  `reference_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pl_user_id` (`user_id`),
  KEY `idx_pl_created_at` (`created_at`),
  KEY `point_logs_user_id` (`user_id`),
  KEY `point_logs_created_at` (`created_at`),
  CONSTRAINT `point_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `point_logs`
--

LOCK TABLES `point_logs` WRITE;
/*!40000 ALTER TABLE `point_logs` DISABLE KEYS */;
INSERT INTO `point_logs` VALUES (1,2,'Survey_Completion',10,1,'survey_responses','Hoàn thành Khảo sát Nhận thức Bảo vệ Môi trường 2025','2026-07-06 15:17:35'),(2,2,'Event_Report',50,1,'participations','Duyệt báo cáo: Chiến dịch dọn rác bãi biển','2026-07-05 20:17:35'),(3,2,'Bonus',20,NULL,NULL,'Thưởng thành viên tích cực tháng trước','2026-07-04 20:17:35'),(4,5,'Survey_Completion',10,2,'survey_responses','Hoàn thành Khảo sát Thói quen sử dụng giấy','2026-05-27 20:17:35'),(5,5,'Event_Report',50,3,'participations','Duyệt báo cáo: Trồng cây đầu xuân','2026-06-26 20:17:35'),(6,5,'Survey_Completion',10,3,'survey_responses','Hoàn thành Khảo sát Giao thông Xanh','2026-07-06 18:17:35'),(7,7,'Survey_Completion',10,4,'survey_responses','Hoàn thành Khảo sát 1','2026-07-04 20:17:35'),(8,7,'Survey_Completion',10,5,'survey_responses','Hoàn thành Khảo sát 6','2026-07-05 20:17:35'),(9,8,'Survey_Completion',10,6,'survey_responses','Hoàn thành Khảo sát 1','2026-07-01 20:17:35'),(10,8,'Survey_Completion',10,7,'survey_responses','Hoàn thành Khảo sát 2','2026-07-02 20:17:35'),(11,8,'Survey_Completion',10,8,'survey_responses','Hoàn thành Khảo sát 5','2026-07-06 08:17:35'),(12,13,'Survey_Completion',10,9,'survey_responses','Hoàn thành Khảo sát 4','2026-05-22 20:17:35'),(13,13,'Survey_Completion',10,10,'survey_responses','Hoàn thành Khảo sát 5','2026-07-06 14:17:35'),(14,13,'Survey_Completion',10,11,'survey_responses','Hoàn thành Khảo sát 6','2026-07-06 18:17:35'),(15,14,'Survey_Completion',10,12,'survey_responses','Hoàn thành Khảo sát 1','2026-06-26 20:17:35'),(16,14,'Survey_Completion',10,13,'survey_responses','Hoàn thành Khảo sát 5','2026-07-03 20:17:35'),(17,14,'Survey_Completion',10,14,'survey_responses','Hoàn thành Khảo sát 6','2026-07-06 20:17:35');
/*!40000 ALTER TABLE `point_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `survey_id` int unsigned NOT NULL,
  `question_text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `question_type` enum('Text','Single_Choice','Multiple_Choice') COLLATE utf8mb4_unicode_ci DEFAULT 'Text',
  `options` json DEFAULT NULL,
  `order_num` int unsigned DEFAULT '0',
  `is_required` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_questions_survey_id` (`survey_id`),
  KEY `questions_survey_id` (`survey_id`),
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES (1,1,'Bạn hiểu biết về vấn đề biến đổi khí hậu ở mức nào?','Single_Choice','[\"Rất hiểu biết\", \"Hiểu biết cơ bản\", \"Biết một chút\", \"Chưa hiểu nhiều\"]',1,1,'2026-07-06 19:15:15'),(2,1,'Bạn thường thực hiện những hành động nào để bảo vệ môi trường?','Multiple_Choice','[\"Phân loại rác tại nhà\", \"Sử dụng túi vải thay túi nhựa\", \"Tiết kiệm điện nước\", \"Sử dụng phương tiện công cộng\", \"Hạn chế dùng đồ nhựa một lần\", \"Trồng cây xanh\"]',2,1,'2026-07-06 19:15:15'),(3,1,'Theo bạn, vấn đề môi trường nào đáng lo ngại nhất hiện nay tại Việt Nam?','Single_Choice','[\"Ô nhiễm không khí\", \"Ô nhiễm nguồn nước\", \"Rác thải nhựa\", \"Phá rừng\", \"Biến đổi khí hậu\"]',3,1,'2026-07-06 19:15:15'),(4,1,'Bạn đã từng tham gia hoạt động tình nguyện bảo vệ môi trường chưa?','Single_Choice','[\"Có, nhiều lần\", \"Có, một vài lần\", \"Chưa nhưng có kế hoạch\", \"Chưa và không có kế hoạch\"]',4,1,'2026-07-06 19:15:15'),(5,1,'Theo bạn, nhà trường có thể làm gì để nâng cao ý thức bảo vệ môi trường trong sinh viên? (Nêu ý kiến cá nhân)','Text',NULL,5,0,'2026-07-06 19:15:15'),(6,2,'Bạn có sử dụng túi vải/hộp cơm cá nhân thay thế đồ nhựa dùng một lần không?','Single_Choice','[\"Luôn luôn\", \"Thường xuyên\", \"Thỉnh thoảng\", \"Hiếm khi\", \"Không bao giờ\"]',1,1,'2026-07-06 19:15:15'),(7,2,'Bạn có thực hiện phân loại rác tại nguồn không?','Single_Choice','[\"Có, thường xuyên\", \"Thỉnh thoảng\", \"Chưa biết cách phân loại\", \"Không\"]',2,1,'2026-07-06 19:15:15'),(8,2,'Bạn đã tham gia những hoạt động xanh nào trong khuôn viên trường?','Multiple_Choice','[\"Ngày hội Môi trường\", \"Chiến dịch Nhặt rác\", \"Trồng cây xanh\", \"Cuộc thi tìm hiểu môi trường\", \"Chưa tham gia hoạt động nào\"]',3,1,'2026-07-06 19:15:15'),(9,2,'Ý kiến của bạn về các hoạt động xanh của nhà trường?','Text',NULL,4,0,'2026-07-06 19:15:15'),(10,4,'Trung bình một tuần bạn in bao nhiêu trang giấy?','Single_Choice','[\"Dưới 50 trang\", \"50 - 100 trang\", \"100 - 500 trang\", \"Trên 500 trang\"]',1,1,'2026-07-06 20:17:35'),(11,4,'Bạn có thói quen sử dụng lại giấy in một mặt không?','Single_Choice','[\"Luôn luôn\", \"Thỉnh thoảng\", \"Không bao giờ\"]',2,1,'2026-07-06 20:17:35'),(12,4,'Góp ý để giảm thiểu lượng giấy in tại phòng ban của bạn:','Text',NULL,3,0,'2026-07-06 20:17:35'),(13,5,'Phương tiện di chuyển chính của bạn đến trường là gì?','Single_Choice','[\"Xe máy cá nhân\", \"Xe buýt\", \"Xe đạp / Xe đạp điện\", \"Đi bộ\", \"Ô tô cá nhân\", \"Xe công nghệ (Grab, Be...)\"]',1,1,'2026-07-06 20:17:35'),(14,5,'Quãng đường từ nhà đến trường của bạn dài khoảng bao nhiêu km?','Single_Choice','[\"Dưới 2km\", \"2 - 5km\", \"5 - 10km\", \"Trên 10km\"]',2,1,'2026-07-06 20:17:35'),(15,5,'Nếu trường cung cấp trạm sạc xe điện miễn phí, bạn có định chuyển sang dùng xe điện không?','Single_Choice','[\"Chắc chắn có\", \"Sẽ cân nhắc\", \"Không có ý định đổi\"]',3,1,'2026-07-06 20:17:35'),(16,6,'Bạn đánh giá thế nào về chất lượng đồ ăn tại căng tin?','Single_Choice','[\"Rất ngon\", \"Khá ngon\", \"Bình thường\", \"Tệ\"]',1,1,'2026-07-06 20:17:35'),(17,6,'Theo bạn, căng tin đã hạn chế việc sử dụng đồ nhựa dùng một lần tốt chưa?','Single_Choice','[\"Rất tốt\", \"Đã có cải thiện nhưng chưa nhiều\", \"Chưa tốt, vẫn dùng rất nhiều đồ nhựa\"]',2,1,'2026-07-06 20:17:35'),(18,6,'Bạn mong muốn căng tin thay đổi điều gì nhất để thân thiện với môi trường hơn?','Multiple_Choice','[\"Không dùng hộp xốp\", \"Sử dụng ống hút giấy/gạo\", \"Khuyến khích mang hộp đựng cá nhân\", \"Bán đồ ăn chay\"]',3,1,'2026-07-06 20:17:35'),(19,6,'Góp ý thêm của bạn:','Text',NULL,4,0,'2026-07-06 20:17:35');
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `token_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `revoked` tinyint(1) DEFAULT '0',
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_hash` (`token_hash`),
  UNIQUE KEY `token_hash_2` (`token_hash`),
  KEY `idx_rt_user_id` (`user_id`),
  CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `survey_answers`
--

DROP TABLE IF EXISTS `survey_answers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `survey_answers` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `response_id` int unsigned NOT NULL,
  `question_id` int unsigned NOT NULL,
  `answer_text` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `idx_sa_response_id` (`response_id`),
  KEY `idx_sa_question_id` (`question_id`),
  KEY `survey_answers_response_id` (`response_id`),
  KEY `survey_answers_question_id` (`question_id`),
  CONSTRAINT `survey_answers_ibfk_3` FOREIGN KEY (`response_id`) REFERENCES `survey_responses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `survey_answers_ibfk_4` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `survey_answers`
--

LOCK TABLES `survey_answers` WRITE;
/*!40000 ALTER TABLE `survey_answers` DISABLE KEYS */;
INSERT INTO `survey_answers` VALUES (1,1,1,'Hiểu biết cơ bản'),(2,1,2,'[\"Phân loại rác tại nhà\", \"Tiết kiệm điện nước\"]'),(3,1,3,'Rác thải nhựa'),(4,1,4,'Có, một vài lần'),(5,1,5,'Trường nên tổ chức thêm các cuộc thi tái chế.'),(6,2,10,'50 - 100 trang'),(7,2,11,'Luôn luôn'),(8,2,12,'Sử dụng e-Office để trình ký văn bản thay vì ký giấy.'),(9,3,13,'Xe buýt'),(10,3,14,'5 - 10km'),(11,3,15,'Sẽ cân nhắc'),(12,4,1,'Rất hiểu biết'),(13,4,2,'[\"Sử dụng phương tiện công cộng\", \"Sử dụng túi vải thay túi nhựa\"]'),(14,4,3,'Ô nhiễm không khí'),(15,4,4,'Chưa nhưng có kế hoạch'),(16,4,5,'Trường nên đưa bộ môn Giáo dục Môi trường vào bắt buộc.'),(17,5,16,'Bình thường'),(18,5,17,'Chưa tốt, vẫn dùng rất nhiều đồ nhựa'),(19,5,18,'[\"Không dùng hộp xốp\", \"Sử dụng ống hút giấy/gạo\"]'),(20,5,19,'Hộp xốp được phát quá nhiều mỗi khi mua mang đi.'),(21,6,1,'Biết một chút'),(22,6,2,'[\"Hạn chế dùng đồ nhựa một lần\"]'),(23,6,3,'Rác thải nhựa'),(24,6,4,'Chưa và không có kế hoạch'),(25,8,13,'Xe máy cá nhân'),(26,8,14,'5 - 10km'),(27,8,15,'Không có ý định đổi'),(28,10,13,'Ô tô cá nhân'),(29,10,14,'Trên 10km'),(30,10,15,'Sẽ cân nhắc'),(31,11,16,'Khá ngon'),(32,11,17,'Đã có cải thiện nhưng chưa nhiều'),(33,11,18,'[\"Khuyến khích mang hộp đựng cá nhân\"]'),(34,11,19,'Nên có khu vực rửa khay/hộp riêng cho sinh viên và cán bộ mang hộp cá nhân.'),(35,12,1,'Rất hiểu biết'),(36,12,2,'[\"Phân loại rác tại nhà\",\"Tiết kiệm điện nước\",\"Trồng cây xanh\"]'),(37,12,3,'Biến đổi khí hậu'),(38,12,4,'Có, nhiều lần'),(39,12,5,'Cần có chế tài nghiêm ngặt hơn.'),(40,13,13,'Đi bộ'),(41,13,14,'Dưới 2km'),(42,13,15,'Chắc chắn có'),(43,14,16,'Rất ngon'),(44,14,17,'Rất tốt'),(45,14,18,'[\"Bán đồ ăn chay\"]'),(46,14,19,'Thực đơn món chay rất tuyệt vời.');
/*!40000 ALTER TABLE `survey_answers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `survey_responses`
--

DROP TABLE IF EXISTS `survey_responses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `survey_responses` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `survey_id` int unsigned NOT NULL,
  `user_id` int unsigned NOT NULL,
  `submitted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_response` (`survey_id`,`user_id`),
  UNIQUE KEY `survey_responses_survey_id_user_id` (`survey_id`,`user_id`),
  KEY `idx_sr_survey_id` (`survey_id`),
  KEY `idx_sr_user_id` (`user_id`),
  KEY `survey_responses_survey_id` (`survey_id`),
  KEY `survey_responses_user_id` (`user_id`),
  CONSTRAINT `survey_responses_ibfk_3` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `survey_responses_ibfk_4` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `survey_responses`
--

LOCK TABLES `survey_responses` WRITE;
/*!40000 ALTER TABLE `survey_responses` DISABLE KEYS */;
INSERT INTO `survey_responses` VALUES (1,1,2,'2026-07-06 15:17:35'),(2,4,5,'2026-05-27 20:17:35'),(3,5,5,'2026-07-06 18:17:35'),(4,1,7,'2026-07-04 20:17:35'),(5,6,7,'2026-07-05 20:17:35'),(6,1,8,'2026-07-01 20:17:35'),(7,2,8,'2026-07-02 20:17:35'),(8,5,8,'2026-07-06 08:17:35'),(9,4,13,'2026-05-22 20:17:35'),(10,5,13,'2026-07-06 14:17:35'),(11,6,13,'2026-07-06 18:17:35'),(12,1,14,'2026-06-26 20:17:35'),(13,5,14,'2026-07-03 20:17:35'),(14,6,14,'2026-07-06 20:17:35');
/*!40000 ALTER TABLE `survey_responses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `surveys`
--

DROP TABLE IF EXISTS `surveys`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `surveys` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `target_role` enum('All','Student','Staff') COLLATE utf8mb4_unicode_ci DEFAULT 'All',
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `status` enum('Draft','Published','Closed') COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  `created_by` int unsigned NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_surveys_status` (`status`),
  KEY `idx_surveys_target_role` (`target_role`),
  KEY `idx_surveys_end_date` (`end_date`),
  KEY `created_by` (`created_by`),
  KEY `surveys_status` (`status`),
  KEY `surveys_target_role` (`target_role`),
  KEY `surveys_end_date` (`end_date`),
  CONSTRAINT `surveys_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `surveys`
--

LOCK TABLES `surveys` WRITE;
/*!40000 ALTER TABLE `surveys` DISABLE KEYS */;
INSERT INTO `surveys` VALUES (1,'Khảo sát Nhận thức Bảo vệ Môi trường 2025','Khảo sát nhằm đánh giá mức độ nhận thức của sinh viên về các vấn đề môi trường hiện nay, bao gồm biến đổi khí hậu, ô nhiễm nhựa và tiết kiệm năng lượng.','Student','2026-07-05 19:15:15','2026-08-05 19:15:15','Published',1,'2026-07-06 19:15:15','2026-07-06 19:15:15'),(2,'Khảo sát Hoạt động Xanh trong Khuôn viên Trường','Khảo sát dành cho toàn thể cán bộ, giảng viên và sinh viên về mức độ tham gia các hoạt động xanh, sử dụng túi vải, phân loại rác tại nguồn.','All','2026-07-04 19:15:15','2026-07-20 19:15:15','Published',1,'2026-07-06 19:15:15','2026-07-06 19:15:15'),(3,'Khảo sát Nội bộ - Tiết kiệm Điện tại Văn phòng','Khảo sát dành riêng cho cán bộ nhân viên về thói quen sử dụng điện và đề xuất cải tiến.','Staff','2026-07-11 19:15:15','2026-08-10 19:15:15','Draft',1,'2026-07-06 19:15:15','2026-07-06 19:15:15'),(4,'Khảo sát Thói quen sử dụng giấy tại Văn phòng','Đánh giá việc in ấn và sử dụng giấy nháp của cán bộ nhân viên để lên phương án số hóa.','Staff','2026-05-07 20:17:35','2026-06-06 20:17:35','Closed',1,'2026-07-06 20:17:35','2026-07-06 20:17:35'),(5,'Khảo sát Giao thông Xanh đến Trường','Bạn di chuyển đến trường bằng phương tiện gì? Hãy chia sẻ để trường bố trí thêm trạm xe đạp/xe buýt.','All','2026-07-05 20:17:35','2026-07-16 20:17:35','Published',1,'2026-07-06 20:17:35','2026-07-06 20:17:35'),(6,'Khảo sát Căng tin & Chất lượng Bữa ăn','Lấy ý kiến phản hồi về chất lượng đồ ăn và vấn đề sử dụng đồ nhựa tại căng tin.','All','2026-07-01 20:17:35','2026-07-21 20:17:35','Published',1,'2026-07-06 20:17:35','2026-07-06 20:17:35');
/*!40000 ALTER TABLE `surveys` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `full_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('Student','Staff','Admin') COLLATE utf8mb4_unicode_ci DEFAULT 'Student',
  `status` enum('Pending','Approved','Rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'Pending',
  `student_staff_id` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `class_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `joined_date` date DEFAULT NULL,
  `ui_theme` enum('light','dark') COLLATE utf8mb4_unicode_ci DEFAULT 'light',
  `avatar_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reject_reason` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username_2` (`username`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `username_3` (`username`),
  UNIQUE KEY `email_3` (`email`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_status` (`status`),
  KEY `users_role` (`role`),
  KEY `users_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'System Administrator','admin','admin@ecosurvey.edu.vn','$2b$10$wudfrdk5avOD.j.zVGA18.ZTKMLwLmpeycOnQ1dx5DWg8PUSNjK1a','Admin','Approved',NULL,NULL,'IT Department','2026-07-06','light',NULL,NULL,'2026-07-06 19:15:15','2026-07-06 19:15:15'),(2,'Nguyễn Văn A','nva_student','nva@student.ecosurvey.edu.vn','$2b$10$wudfrdk5avOD.j.zVGA18.ZTKMLwLmpeycOnQ1dx5DWg8PUSNjK1a','Student','Approved','SV2023001','IT1','Khoa CNTT','2023-09-05','light',NULL,NULL,'2026-07-06 20:17:35','2026-07-06 20:17:35'),(3,'Trần Thị B','ttb_student','ttb@student.ecosurvey.edu.vn','$2b$10$wudfrdk5avOD.j.zVGA18.ZTKMLwLmpeycOnQ1dx5DWg8PUSNjK1a','Student','Pending','SV2023002','KT1','Khoa Kinh tế','2023-09-10','light',NULL,NULL,'2026-07-06 20:17:35','2026-07-06 20:17:35'),(4,'Lê Văn C','lvc_student','lvc@student.ecosurvey.edu.vn','$2b$10$wudfrdk5avOD.j.zVGA18.ZTKMLwLmpeycOnQ1dx5DWg8PUSNjK1a','Student','Rejected','SV2023003','MT1','Khoa Môi trường','2023-09-12','light',NULL,'Hình ảnh thẻ sinh viên không hợp lệ','2026-07-06 20:17:35','2026-07-06 20:17:35'),(5,'Phạm Cán Bộ','pcb_staff','pcb@ecosurvey.edu.vn','$2b$10$wudfrdk5avOD.j.zVGA18.ZTKMLwLmpeycOnQ1dx5DWg8PUSNjK1a','Staff','Approved','CB001',NULL,'Phòng Đào tạo','2020-01-15','light',NULL,NULL,'2026-07-06 20:17:35','2026-07-06 20:17:35'),(6,'Hoàng Cán Bộ','hcb_staff','hcb@ecosurvey.edu.vn','$2b$10$wudfrdk5avOD.j.zVGA18.ZTKMLwLmpeycOnQ1dx5DWg8PUSNjK1a','Staff','Approved','CB002',NULL,'Phòng Hành chính','2019-05-20','light',NULL,NULL,'2026-07-06 20:17:35','2026-07-06 20:17:35'),(7,'Đinh Văn Nam','dv_nam','nam.dv@student.ecosurvey.edu.vn','$2b$10$wudfrdk5avOD.j.zVGA18.ZTKMLwLmpeycOnQ1dx5DWg8PUSNjK1a','Student','Approved','SV2023004','IT2','Khoa CNTT','2023-09-01','light',NULL,NULL,'2026-07-06 20:17:35','2026-07-06 20:17:35'),(8,'Bùi Thị Lan','bt_lan','lan.bt@student.ecosurvey.edu.vn','$2b$10$wudfrdk5avOD.j.zVGA18.ZTKMLwLmpeycOnQ1dx5DWg8PUSNjK1a','Student','Approved','SV2023005','KT2','Khoa Kinh tế','2023-09-02','light',NULL,NULL,'2026-07-06 20:17:35','2026-07-06 20:17:35'),(9,'Vũ Đức Hải','vd_hai','hai.vd@student.ecosurvey.edu.vn','$2b$10$wudfrdk5avOD.j.zVGA18.ZTKMLwLmpeycOnQ1dx5DWg8PUSNjK1a','Student','Approved','SV2023006','MT1','Khoa Môi trường','2023-09-03','light',NULL,NULL,'2026-07-06 20:17:35','2026-07-06 20:17:35'),(10,'Phan Mỹ Tâm','pm_tam','tam.pm@student.ecosurvey.edu.vn','$2b$10$wudfrdk5avOD.j.zVGA18.ZTKMLwLmpeycOnQ1dx5DWg8PUSNjK1a','Student','Approved','SV2023007','NN1','Khoa Ngoại ngữ','2023-09-04','light',NULL,NULL,'2026-07-06 20:17:35','2026-07-06 20:17:35'),(11,'Ngô Minh Khang','nm_khang','khang.nm@student.ecosurvey.edu.vn','$2b$10$wudfrdk5avOD.j.zVGA18.ZTKMLwLmpeycOnQ1dx5DWg8PUSNjK1a','Student','Approved','SV2023008','IT1','Khoa CNTT','2023-09-05','light',NULL,NULL,'2026-07-06 20:17:35','2026-07-06 20:17:35'),(12,'Lý Tiểu Long','lt_long','long.lt@student.ecosurvey.edu.vn','$2b$10$wudfrdk5avOD.j.zVGA18.ZTKMLwLmpeycOnQ1dx5DWg8PUSNjK1a','Student','Approved','SV2023009','IT2','Khoa CNTT','2023-09-06','light',NULL,NULL,'2026-07-06 20:17:35','2026-07-06 20:17:35'),(13,'Đặng Thái Sơn','dt_son','son.dt@ecosurvey.edu.vn','$2b$10$wudfrdk5avOD.j.zVGA18.ZTKMLwLmpeycOnQ1dx5DWg8PUSNjK1a','Staff','Approved','CB003',NULL,'Phòng Công tác Sinh viên','2021-02-15','light',NULL,NULL,'2026-07-06 20:17:35','2026-07-06 20:17:35'),(14,'Trương Lệ Na','tl_na','na.tl@ecosurvey.edu.vn','$2b$10$wudfrdk5avOD.j.zVGA18.ZTKMLwLmpeycOnQ1dx5DWg8PUSNjK1a','Staff','Approved','CB004',NULL,'Khoa Môi trường','2018-08-10','light',NULL,NULL,'2026-07-06 20:17:35','2026-07-06 20:17:35'),(15,'Hồ Ngọc Hà','hn_ha','ha.hn@ecosurvey.edu.vn','$2b$10$wudfrdk5avOD.j.zVGA18.ZTKMLwLmpeycOnQ1dx5DWg8PUSNjK1a','Staff','Approved','CB005',NULL,'Phòng Tài chính','2022-05-01','light',NULL,NULL,'2026-07-06 20:17:35','2026-07-06 20:17:35');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-06 21:01:02
