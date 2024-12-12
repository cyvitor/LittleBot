/*
Navicat MySQL Data Transfer

Source Server         : VL_5_deb10_lab
Source Server Version : 50505
Source Host           : 172.16.55.200:3306
Source Database       : littlebot

Target Server Type    : MYSQL
Target Server Version : 50505
File Encoding         : 65001

Date: 2024-12-12 16:53:39
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
) ENGINE=InnoDB AUTO_INCREMENT=686 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `investment_spot` double DEFAULT 0,
  `status` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`accid`)
) ENGINE=InnoDB AUTO_INCREMENT=87 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Table structure for accs_balances_spot
-- ----------------------------
DROP TABLE IF EXISTS `accs_balances_spot`;
CREATE TABLE `accs_balances_spot` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `accid` int(11) DEFAULT NULL,
  `asset` varchar(255) DEFAULT NULL,
  `free` double DEFAULT NULL,
  `locked` double DEFAULT NULL,
  `datatime` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=149 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `avgPrice` double DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `side` varchar(255) DEFAULT NULL,
  `datatime` datetime DEFAULT NULL,
  PRIMARY KEY (`accs_orders_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1408 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Table structure for accs_orders_open
-- ----------------------------
DROP TABLE IF EXISTS `accs_orders_open`;
CREATE TABLE `accs_orders_open` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `acc_id` int(11) NOT NULL,
  `order_id` bigint(20) NOT NULL,
  `symbol` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `price` double DEFAULT NULL,
  `avgPrice` double DEFAULT NULL,
  `origQty` double DEFAULT NULL,
  `executedQty` double DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `reduceOnly` varchar(255) DEFAULT NULL,
  `closePosition` varchar(255) DEFAULT NULL,
  `side` varchar(255) DEFAULT NULL,
  `positionSide` varchar(255) DEFAULT NULL,
  `stopPrice` decimal(10,0) DEFAULT NULL,
  `time` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Table structure for accs_orders_spot
-- ----------------------------
DROP TABLE IF EXISTS `accs_orders_spot`;
CREATE TABLE `accs_orders_spot` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `acc_id` int(11) DEFAULT NULL,
  `order_spot_id` int(11) DEFAULT NULL,
  `orderId` varchar(255) DEFAULT NULL,
  `origQty` double DEFAULT NULL,
  `executedQty` double DEFAULT NULL,
  `acquiredAmount` double DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `side` varchar(255) DEFAULT NULL,
  `fills` varchar(255) DEFAULT NULL,
  `datatime` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Table structure for accs_positions
-- ----------------------------
DROP TABLE IF EXISTS `accs_positions`;
CREATE TABLE `accs_positions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `acc_id` int(11) DEFAULT NULL,
  `symbol` varchar(255) DEFAULT NULL,
  `unrealizedProfit` varchar(255) DEFAULT NULL,
  `leverage` int(11) DEFAULT NULL,
  `entryPrice` double DEFAULT NULL,
  `positionSide` varchar(255) DEFAULT NULL,
  `positionAmt` varchar(255) DEFAULT NULL,
  `updateTime` varchar(255) DEFAULT NULL,
  `bidNotional` varchar(255) DEFAULT NULL,
  `askNotional` varchar(255) DEFAULT NULL,
  `bot_status` int(11) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Table structure for dt_monit
-- ----------------------------
DROP TABLE IF EXISTS `dt_monit`;
CREATE TABLE `dt_monit` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `symbol` varchar(255) DEFAULT NULL,
  `timeframe` varchar(255) DEFAULT NULL,
  `ema` int(11) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `priceTolerance` double DEFAULT NULL,
  `leverage` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `targetPercent` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Table structure for dt_opers
-- ----------------------------
DROP TABLE IF EXISTS `dt_opers`;
CREATE TABLE `dt_opers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `oper_id` varchar(255) DEFAULT NULL,
  `dt_monit_id` int(11) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `datatime` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=540 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `oper_id` varchar(11) DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=517 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Table structure for ordens_spot
-- ----------------------------
DROP TABLE IF EXISTS `ordens_spot`;
CREATE TABLE `ordens_spot` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `symbol` varchar(255) DEFAULT NULL,
  `quantity` varchar(255) DEFAULT NULL,
  `price` double DEFAULT NULL,
  `target1` double DEFAULT NULL,
  `stoploss` double DEFAULT NULL,
  `startOp` varchar(255) DEFAULT NULL,
  `startPrice` double(10,0) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `datahora` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Table structure for ordens_st
-- ----------------------------
DROP TABLE IF EXISTS `ordens_st`;
CREATE TABLE `ordens_st` (
  `ordens_st_id` int(11) NOT NULL AUTO_INCREMENT,
  `desc` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ordens_st_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Table structure for pairs
-- ----------------------------
DROP TABLE IF EXISTS `pairs`;
CREATE TABLE `pairs` (
  `pair_id` int(11) NOT NULL AUTO_INCREMENT,
  `pair` varchar(255) DEFAULT NULL,
  `price` double DEFAULT NULL,
  PRIMARY KEY (`pair_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Table structure for params_conf
-- ----------------------------
DROP TABLE IF EXISTS `params_conf`;
CREATE TABLE `params_conf` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `param` varchar(255) DEFAULT NULL,
  `value` varchar(400) DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Table structure for pbm_workers
-- ----------------------------
DROP TABLE IF EXISTS `pbm_workers`;
CREATE TABLE `pbm_workers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `wkey` varchar(255) DEFAULT '',
  `status` int(11) DEFAULT NULL,
  `bot_cmd` int(11) DEFAULT 0,
  `descr` varchar(255) DEFAULT NULL,
  `configs` varchar(255) DEFAULT NULL,
  `last_update` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Table structure for pbm_workers_accs
-- ----------------------------
DROP TABLE IF EXISTS `pbm_workers_accs`;
CREATE TABLE `pbm_workers_accs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `worker_id` int(11) DEFAULT NULL,
  `acc_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `symbols` varchar(255) DEFAULT NULL,
  `configs` varchar(255) DEFAULT NULL,
  `status` int(255) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Table structure for pbm_workers_dashboard
-- ----------------------------
DROP TABLE IF EXISTS `pbm_workers_dashboard`;
CREATE TABLE `pbm_workers_dashboard` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `worker_id` int(11) DEFAULT NULL,
  `acc_nick` varchar(255) DEFAULT NULL,
  `acc_id` int(11) DEFAULT NULL,
  `symbols` varchar(255) DEFAULT NULL,
  `exposure_limit` varchar(255) DEFAULT NULL,
  `datatime` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Table structure for pbm_workers_json_configs
-- ----------------------------
DROP TABLE IF EXISTS `pbm_workers_json_configs`;
CREATE TABLE `pbm_workers_json_configs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `json` varchar(10000) DEFAULT '',
  `descr` varchar(255) DEFAULT NULL,
  `datatime` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Table structure for stc_clientes
-- ----------------------------
DROP TABLE IF EXISTS `stc_clientes`;
CREATE TABLE `stc_clientes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `senha` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Table structure for stc_clientes_accs
-- ----------------------------
DROP TABLE IF EXISTS `stc_clientes_accs`;
CREATE TABLE `stc_clientes_accs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) DEFAULT NULL,
  `acc_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `tickSize` varchar(255) DEFAULT '',
  `minQty` varchar(255) DEFAULT '',
  `status_spot` varchar(255) DEFAULT NULL,
  `datatime` datetime DEFAULT NULL,
  PRIMARY KEY (`symbols_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2884 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
