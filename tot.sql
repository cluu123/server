/*
 Navicat Premium Data Transfer

 Source Server         : loca
 Source Server Type    : MySQL
 Source Server Version : 80033
 Source Host           : 127.0.0.1:3306
 Source Schema         : tot

 Target Server Type    : MySQL
 Target Server Version : 80033
 File Encoding         : 65001

 Date: 19/12/2023 16:57:44
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for City
-- ----------------------------
DROP TABLE IF EXISTS `City`;
CREATE TABLE `City` (
  `c_id` int DEFAULT NULL COMMENT '城市id',
  `c_name` varchar(30) DEFAULT NULL COMMENT '城市名字',
  `c_provinceId` int DEFAULT NULL COMMENT '所属省份id',
  KEY `c_id` (`c_id`),
  KEY `c_provinceId` (`c_provinceId`),
  CONSTRAINT `city_ibfk_1` FOREIGN KEY (`c_provinceId`) REFERENCES `City` (`c_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for Friend
-- ----------------------------
DROP TABLE IF EXISTS `Friend`;
CREATE TABLE `Friend` (
  `f_id` int NOT NULL AUTO_INCREMENT COMMENT '主键',
  `f_friendId` varchar(255) DEFAULT NULL COMMENT '好友id',
  `f_userId` varchar(255) DEFAULT NULL COMMENT '自己id',
  `f_name` varchar(30) DEFAULT NULL COMMENT '备注昵称',
  `f_friendType` int DEFAULT NULL COMMENT '好友类型 0 不是好友 1 已申请 2 已经是好友\n3 申请中 4 已拒绝',
  `f_friendGroupsId` int DEFAULT NULL COMMENT '所属分组',
  `f_onceMessage` tinyint DEFAULT NULL COMMENT '0 第一次发消息 1 不是第一次发消息',
  PRIMARY KEY (`f_id`),
  KEY `f_friendId` (`f_friendId`)
) ENGINE=InnoDB AUTO_INCREMENT=184 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for FriendGroups
-- ----------------------------
DROP TABLE IF EXISTS `FriendGroups`;
CREATE TABLE `FriendGroups` (
  `fg_id` int NOT NULL AUTO_INCREMENT,
  `fg_name` varchar(50) DEFAULT NULL COMMENT '分组名字',
  `fg_userId` int DEFAULT NULL COMMENT '用户id',
  PRIMARY KEY (`fg_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for FriendType
-- ----------------------------
DROP TABLE IF EXISTS `FriendType`;
CREATE TABLE `FriendType` (
  `ft_id` int NOT NULL AUTO_INCREMENT,
  `ft_name` varchar(20) DEFAULT NULL COMMENT '类型名称',
  PRIMARY KEY (`ft_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for Group_Id
-- ----------------------------
DROP TABLE IF EXISTS `Group_Id`;
CREATE TABLE `Group_Id` (
  `group_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `admin_id` varchar(255) DEFAULT NULL,
  `time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `img` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`group_id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for Group_mes
-- ----------------------------
DROP TABLE IF EXISTS `Group_mes`;
CREATE TABLE `Group_mes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_id` int DEFAULT NULL,
  `message` varchar(255) DEFAULT NULL,
  `uid` varchar(255) DEFAULT NULL,
  `status` tinyint DEFAULT NULL,
  `type` tinyint DEFAULT NULL,
  `time` text,
  PRIMARY KEY (`id`),
  KEY `group_id` (`group_id`)
) ENGINE=InnoDB AUTO_INCREMENT=228 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for Group_User
-- ----------------------------
DROP TABLE IF EXISTS `Group_User`;
CREATE TABLE `Group_User` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) DEFAULT NULL,
  `group_name` varchar(255) DEFAULT NULL,
  `group_id` varchar(255) DEFAULT NULL,
  `admin_id` varchar(255) DEFAULT NULL,
  `time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` tinyint DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for Message
-- ----------------------------
DROP TABLE IF EXISTS `Message`;
CREATE TABLE `Message` (
  `m_id` int NOT NULL AUTO_INCREMENT,
  `m_postMessage` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '消息内容',
  `m_status` tinyint DEFAULT NULL COMMENT '接受状态 0 未读 1 已读\n',
  `m_time` text COMMENT '发送时间',
  `m_messType` tinyint DEFAULT NULL COMMENT '消息类型 0 text 1 img',
  `m_formUserId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '发送者id指向用户表',
  `m_toUserId` varchar(255) DEFAULT NULL COMMENT '接受者id指向用户表',
  PRIMARY KEY (`m_id`),
  KEY `m_messTypeId` (`m_messType`),
  KEY `m_formUserId` (`m_formUserId`),
  KEY `m_toUserId` (`m_toUserId`)
) ENGINE=InnoDB AUTO_INCREMENT=692 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for MessageType
-- ----------------------------
DROP TABLE IF EXISTS `MessageType`;
CREATE TABLE `MessageType` (
  `mt_id` int NOT NULL AUTO_INCREMENT,
  `mt_name` varchar(20) DEFAULT NULL COMMENT '类型名称',
  PRIMARY KEY (`mt_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for Nation
-- ----------------------------
DROP TABLE IF EXISTS `Nation`;
CREATE TABLE `Nation` (
  `n_id` int NOT NULL,
  `n_name` varchar(30) DEFAULT NULL COMMENT '名字'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for Province
-- ----------------------------
DROP TABLE IF EXISTS `Province`;
CREATE TABLE `Province` (
  `p_id` int NOT NULL COMMENT '省份id',
  `p_name` varchar(30) DEFAULT NULL COMMENT '省份名字',
  `p_nationId` int DEFAULT NULL COMMENT '所属国家id',
  KEY `p_id` (`p_id`),
  KEY `p_nationId` (`p_nationId`),
  CONSTRAINT `province_ibfk_1` FOREIGN KEY (`p_nationId`) REFERENCES `Province` (`p_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for User
-- ----------------------------
DROP TABLE IF EXISTS `User`;
CREATE TABLE `User` (
  `u_id` int NOT NULL AUTO_INCREMENT,
  `u_loginId` varchar(20) DEFAULT NULL COMMENT '账号',
  `u_nickName` varchar(20) DEFAULT NULL COMMENT '昵称',
  `u_password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '密码',
  `u_signaTure` varchar(255) DEFAULT NULL COMMENT '个性签名',
  `u_sex` bit(1) DEFAULT NULL COMMENT '性别',
  `u_birthday` datetime DEFAULT NULL COMMENT '生日',
  `u_telephone` varchar(30) DEFAULT NULL COMMENT '电话',
  `u_name` varchar(30) DEFAULT NULL COMMENT '真实姓名',
  `u_email` varchar(50) DEFAULT NULL COMMENT '邮箱',
  `u_info` varchar(300) DEFAULT NULL COMMENT '简介',
  `u_headImg` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '头像',
  `u_shengXiao` char(2) DEFAULT '' COMMENT '生肖',
  `u_age` int DEFAULT NULL COMMENT '年龄',
  `u_constellation` char(6) DEFAULT NULL COMMENT '星座',
  `u_bloodType` varchar(10) DEFAULT NULL COMMENT '血型',
  `u_school` varchar(50) DEFAULT NULL COMMENT '学校',
  `u_nationId` int DEFAULT NULL COMMENT '国家id',
  `u_provinecId` int DEFAULT NULL COMMENT '省份id',
  `u_cityId` int DEFAULT NULL COMMENT '城市id',
  `u_friendPolicyId` int DEFAULT NULL COMMENT '好友策略id',
  `u_userStateId` int DEFAULT NULL COMMENT '用户状态id',
  `u_friendQuestion` varchar(30) DEFAULT NULL COMMENT '好友策略问题',
  `u_friendAnswer` varchar(30) DEFAULT NULL COMMENT '好友策略答案',
  `u_friendPassword` varchar(30) DEFAULT NULL COMMENT '好友策略密码',
  `color` varchar(255) DEFAULT NULL,
  `bgColor` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`u_id`),
  KEY `u_nationId` (`u_nationId`),
  CONSTRAINT `user_ibfk_1` FOREIGN KEY (`u_nationId`) REFERENCES `User` (`u_id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for USER_FRIENDPOLICY
-- ----------------------------
DROP TABLE IF EXISTS `USER_FRIENDPOLICY`;
CREATE TABLE `USER_FRIENDPOLICY` (
  `u_fp_id` int NOT NULL AUTO_INCREMENT,
  `u_friendPolicyId` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '好友添加方式',
  PRIMARY KEY (`u_fp_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for User_Groups
-- ----------------------------
DROP TABLE IF EXISTS `User_Groups`;
CREATE TABLE `User_Groups` (
  `ug_id` int NOT NULL AUTO_INCREMENT,
  `ug_name` varchar(30) DEFAULT NULL COMMENT '群名称',
  `ug_createTime` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '创建时间',
  `ug_adminId` int DEFAULT NULL COMMENT '群主id指向用户表',
  `ug_icon` varchar(30) DEFAULT NULL COMMENT '群图标',
  `ug_notice` varchar(200) DEFAULT NULL COMMENT '群公告',
  `ug_intro` varchar(200) DEFAULT NULL COMMENT '群简介',
  PRIMARY KEY (`ug_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for User_GroupsMsgContent
-- ----------------------------
DROP TABLE IF EXISTS `User_GroupsMsgContent`;
CREATE TABLE `User_GroupsMsgContent` (
  `gm_id` int NOT NULL,
  `gm_content` text COMMENT '消息内容',
  `gm_fromId` int DEFAULT NULL COMMENT '发送者id',
  `gm_formName` varchar(30) DEFAULT NULL COMMENT '发送者昵称',
  `gm_createTime` datetime DEFAULT NULL COMMENT '发送时间',
  PRIMARY KEY (`gm_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for User_GroupsMsgToUser
-- ----------------------------
DROP TABLE IF EXISTS `User_GroupsMsgToUser`;
CREATE TABLE `User_GroupsMsgToUser` (
  `gm_id` int NOT NULL,
  `gm_userId` int DEFAULT NULL COMMENT '接受者id',
  `gm_groupMsgId` int DEFAULT NULL COMMENT '群消息id',
  `gm_state` bit(1) DEFAULT NULL COMMENT '接受状态',
  `gm_createTime` datetime DEFAULT NULL COMMENT '发送时间',
  PRIMARY KEY (`gm_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for User_GroupsMsgUserToUser
-- ----------------------------
DROP TABLE IF EXISTS `User_GroupsMsgUserToUser`;
CREATE TABLE `User_GroupsMsgUserToUser` (
  `gm_id` int NOT NULL,
  `gm_fromUserId` int DEFAULT NULL COMMENT '发送者id',
  `gm_fromUserName` varchar(30) DEFAULT NULL COMMENT '发送者昵称',
  `gm_toUserId` int DEFAULT NULL COMMENT '接受者id',
  `gm_msgContent` varchar(300) DEFAULT NULL COMMENT '消息内容',
  `gm_state` bit(1) DEFAULT NULL COMMENT '接受状态',
  `gm_createTime` datetime DEFAULT NULL COMMENT '发送时间',
  `gm_userGroupId` int DEFAULT NULL COMMENT '所属群id',
  PRIMARY KEY (`gm_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for User_GroupsToUser
-- ----------------------------
DROP TABLE IF EXISTS `User_GroupsToUser`;
CREATE TABLE `User_GroupsToUser` (
  `ug_id` int NOT NULL,
  `ug_userId` int DEFAULT NULL COMMENT '用户id',
  `ug_groupId` int DEFAULT NULL COMMENT '群id',
  `ug_createTime` datetime DEFAULT NULL COMMENT '发送时间',
  `ug_groupNick` varchar(15) DEFAULT NULL COMMENT '群内用户昵称',
  PRIMARY KEY (`ug_id`),
  KEY `ug_userId` (`ug_userId`),
  KEY `ug_groupId` (`ug_groupId`),
  CONSTRAINT `user_groupstouser_ibfk_1` FOREIGN KEY (`ug_userId`) REFERENCES `User_GroupsToUser` (`ug_id`),
  CONSTRAINT `user_groupstouser_ibfk_2` FOREIGN KEY (`ug_groupId`) REFERENCES `User_GroupsToUser` (`ug_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET FOREIGN_KEY_CHECKS = 1;
