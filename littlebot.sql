/*
Navicat MySQL Data Transfer

Source Server         : VL_5_deb10_lab
Source Server Version : 50505
Source Host           : 172.16.55.200:3306
Source Database       : littlebot

Target Server Type    : MYSQL
Target Server Version : 50505
File Encoding         : 65001

Date: 2023-03-14 10:57:58
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for acc_msg
-- ----------------------------
DROP TABLE IF EXISTS `acc_msg`;
CREATE TABLE `acc_msg` (
  `acc_msg_id` int(11) NOT NULL AUTO_INCREMENT,
  `acc_id` int(11) DEFAULT NULL,
  `msg` varchar(255) DEFAULT '',
  `msg_code` varchar(255) DEFAULT NULL,
  `datatime` datetime DEFAULT NULL,
  PRIMARY KEY (`acc_msg_id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for accs
-- ----------------------------
DROP TABLE IF EXISTS `accs`;
CREATE TABLE `accs` (
  `accid` int(11) NOT NULL AUTO_INCREMENT,
  `nick` varchar(255) DEFAULT '',
  `apiKey` varchar(255) DEFAULT NULL,
  `apiSecret` varchar(255) DEFAULT NULL,
  `investment` double DEFAULT 0,
  `status` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`accid`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for accs_balances
-- ----------------------------
DROP TABLE IF EXISTS `accs_balances`;
CREATE TABLE `accs_balances` (
  `acc_b_id` int(11) NOT NULL AUTO_INCREMENT,
  `accid` int(11) DEFAULT NULL,
  `asset` varchar(20) DEFAULT '',
  `balance` double DEFAULT NULL,
  `availableBalance` double DEFAULT NULL,
  `datatime` datetime DEFAULT NULL,
  PRIMARY KEY (`acc_b_id`)
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for accs_orders
-- ----------------------------
DROP TABLE IF EXISTS `accs_orders`;
CREATE TABLE `accs_orders` (
  `accs_orders_id` int(11) NOT NULL AUTO_INCREMENT,
  `acc_id` int(11) DEFAULT NULL,
  `order_id` int(11) DEFAULT NULL,
  `orderId` varchar(255) DEFAULT '',
  `status` varchar(255) DEFAULT NULL,
  `origQty` double DEFAULT NULL,
  `executedQty` double DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `side` varchar(255) DEFAULT NULL,
  `datatime` datetime DEFAULT NULL,
  PRIMARY KEY (`accs_orders_id`)
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for ordens
-- ----------------------------
DROP TABLE IF EXISTS `ordens`;
CREATE TABLE `ordens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `symbol` varchar(255) DEFAULT NULL,
  `side` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `quantity` varchar(255) DEFAULT NULL,
  `price` double DEFAULT 0,
  `target1` double DEFAULT 0,
  `stopLoss` double DEFAULT 0,
  `startOp` varchar(255) DEFAULT '',
  `startPrice` double DEFAULT 0,
  `leverage` varchar(255) DEFAULT '',
  `status` varchar(255) DEFAULT NULL,
  `datahora` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for ordens_st
-- ----------------------------
DROP TABLE IF EXISTS `ordens_st`;
CREATE TABLE `ordens_st` (
  `ordens_st_id` int(11) NOT NULL AUTO_INCREMENT,
  `desc` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ordens_st_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for pairs
-- ----------------------------
DROP TABLE IF EXISTS `pairs`;
CREATE TABLE `pairs` (
  `pair_id` int(11) NOT NULL AUTO_INCREMENT,
  `pair` varchar(255) DEFAULT NULL,
  `price` double DEFAULT NULL,
  PRIMARY KEY (`pair_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for symbols
-- ----------------------------
DROP TABLE IF EXISTS `symbols`;
CREATE TABLE `symbols` (
  `symbols_id` int(11) NOT NULL AUTO_INCREMENT,
  `symbol` varchar(255) DEFAULT NULL,
  `quantityPrecision` varchar(255) DEFAULT NULL,
  `baseAssetPrecision` varchar(255) DEFAULT NULL,
  `quotePrecision` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `baseAsset` varchar(255) DEFAULT NULL,
  `quoteAsset` varchar(255) DEFAULT NULL,
  `datatime` datetime DEFAULT NULL,
  PRIMARY KEY (`symbols_id`)
) ENGINE=InnoDB AUTO_INCREMENT=207 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `login` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;
