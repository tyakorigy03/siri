-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 06, 2026 at 12:43 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `siri_platform`
--

-- --------------------------------------------------------

--
-- Table structure for table `assets`
--

CREATE TABLE `assets` (
  `id` varchar(50) NOT NULL,
  `business_id` int(11) NOT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `asset_name` varchar(255) NOT NULL,
  `asset_type` enum('BUILDING','VEHICLE','EQUIPMENT','FURNITURE','COMPUTER') NOT NULL,
  `purchase_date` date NOT NULL,
  `purchase_cost` decimal(15,2) NOT NULL,
  `useful_life_years` int(11) NOT NULL,
  `depreciation_method` enum('STRAIGHT_LINE','DECLINING_BALANCE') DEFAULT 'STRAIGHT_LINE',
  `accumulated_depreciation` decimal(15,2) DEFAULT 0.00,
  `current_book_value` decimal(15,2) DEFAULT NULL,
  `status` enum('ACTIVE','DISPOSED') DEFAULT 'ACTIVE',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `assets`
--

INSERT INTO `assets` (`id`, `business_id`, `branch_id`, `asset_name`, `asset_type`, `purchase_date`, `purchase_cost`, `useful_life_years`, `depreciation_method`, `accumulated_depreciation`, `current_book_value`, `status`, `created_at`) VALUES
('AST-444874-0001', 1, 1, 'Store Building - Downtown', 'BUILDING', '2023-01-01', 50000000.00, 20, 'STRAIGHT_LINE', 5000000.00, 45000000.00, 'ACTIVE', '2026-01-02 09:34:04'),
('AST-444874-0002', 1, 1, 'Delivery Truck Toyota', 'VEHICLE', '2023-01-01', 15000000.00, 5, 'STRAIGHT_LINE', 6000000.00, 9000000.00, 'ACTIVE', '2026-01-02 09:34:04');

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint(20) NOT NULL,
  `business_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `table_name` varchar(100) NOT NULL,
  `record_id` varchar(50) NOT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bank_accounts`
--

CREATE TABLE `bank_accounts` (
  `id` int(11) NOT NULL,
  `business_id` int(11) NOT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `account_name` varchar(255) NOT NULL,
  `bank_name` varchar(255) NOT NULL,
  `account_number` varchar(100) NOT NULL,
  `account_type` enum('CHECKING','SAVINGS','MOMO') DEFAULT 'CHECKING',
  `currency` varchar(3) DEFAULT 'RWF',
  `current_balance` decimal(15,2) DEFAULT 0.00,
  `status` enum('ACTIVE','INACTIVE','CLOSED') DEFAULT 'ACTIVE',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bank_accounts`
--

INSERT INTO `bank_accounts` (`id`, `business_id`, `branch_id`, `account_name`, `bank_name`, `account_number`, `account_type`, `currency`, `current_balance`, `status`, `created_at`) VALUES
(1, 1, 1, 'TechRetail Operating Account', 'Bank of Kigali', '4001234567890', 'CHECKING', 'RWF', 15000000.00, 'ACTIVE', '2026-01-02 09:34:04'),
(2, 1, 1, 'TechRetail Savings', 'Equity Bank', '3001234567891', 'SAVINGS', 'RWF', 5000000.00, 'ACTIVE', '2026-01-02 09:34:04'),
(3, 1, NULL, 'MTN Mobile Money', 'MTN Rwanda', '250788123456', 'MOMO', 'RWF', 2000000.00, 'ACTIVE', '2026-01-02 09:34:04');

-- --------------------------------------------------------

--
-- Table structure for table `bank_reconciliations`
--

CREATE TABLE `bank_reconciliations` (
  `id` varchar(50) NOT NULL,
  `bank_account_id` int(11) NOT NULL,
  `period_start` date NOT NULL,
  `period_end` date NOT NULL,
  `statement_balance` decimal(15,2) NOT NULL,
  `book_balance` decimal(15,2) NOT NULL,
  `variance` decimal(15,2) DEFAULT 0.00,
  `status` enum('IN_PROGRESS','COMPLETED') DEFAULT 'IN_PROGRESS',
  `reconciled_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bank_transactions`
--

CREATE TABLE `bank_transactions` (
  `id` varchar(50) NOT NULL,
  `bank_account_id` int(11) NOT NULL,
  `transaction_date` date NOT NULL,
  `trans_type` enum('DEPOSIT','WITHDRAWAL','TRANSFER','FEE','INTEREST') NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `balance_after` decimal(15,2) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `reconciled` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `branches`
--

CREATE TABLE `branches` (
  `id` int(11) NOT NULL,
  `business_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(20) NOT NULL,
  `branch_type` enum('MAIN','STORE','WAREHOUSE','OFFICE','OUTLET') DEFAULT 'STORE',
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `branches`
--

INSERT INTO `branches` (`id`, `business_id`, `name`, `code`, `branch_type`, `address`, `city`, `country`, `phone`, `email`, `active`, `created_at`, `updated_at`) VALUES
(1, 1, 'Downtown Main Store', 'BR-DWTN', 'MAIN', 'KN 5 Ave, Kigali', 'Kigali', 'Rwanda', '+250788111222', NULL, 1, '2026-01-02 09:34:03', '2026-01-02 09:34:03'),
(2, 1, 'Airport Branch', 'BR-ARPT', 'OUTLET', 'Kigali International Airport', 'Kigali', 'Rwanda', '+250788333444', NULL, 1, '2026-01-02 09:34:03', '2026-01-02 09:34:03'),
(3, 1, 'Kimironko Store', 'BR-KIMI', 'STORE', 'Kimironko Market', 'Kigali', 'Rwanda', '+250788555666', NULL, 1, '2026-01-02 09:34:03', '2026-01-02 09:34:03');

-- --------------------------------------------------------

--
-- Table structure for table `business`
--

CREATE TABLE `business` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `tin` varchar(50) DEFAULT NULL,
  `business_type` enum('RETAIL','WHOLESALE','RESTAURANT','HOTEL','SERVICE','MANUFACTURING','MIXED') DEFAULT 'RETAIL',
  `vat_enabled` tinyint(1) DEFAULT 0,
  `default_vat_rate` decimal(5,2) DEFAULT 18.00,
  `pricing_mode` enum('INCLUSIVE','EXCLUSIVE') DEFAULT 'INCLUSIVE',
  `base_currency` varchar(3) DEFAULT 'RWF',
  `fiscal_year_start` int(11) DEFAULT 1,
  `logo_url` varchar(500) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `business`
--

INSERT INTO `business` (`id`, `name`, `tin`, `business_type`, `vat_enabled`, `default_vat_rate`, `pricing_mode`, `base_currency`, `fiscal_year_start`, `logo_url`, `email`, `phone`, `address`, `active`, `created_at`, `updated_at`) VALUES
(1, 'TechRetail Group', 'TIN-123456789', 'RETAIL', 1, 18.00, 'INCLUSIVE', 'RWF', 1, NULL, 'info@techretail.rw', '+250788123456', NULL, 1, '2026-01-02 09:34:03', '2026-01-02 09:34:03');

-- --------------------------------------------------------

--
-- Table structure for table `business_days`
--

CREATE TABLE `business_days` (
  `id` varchar(50) NOT NULL,
  `branch_id` int(11) NOT NULL,
  `business_date` date NOT NULL,
  `opened_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `closed_at` timestamp NULL DEFAULT NULL,
  `opening_float` decimal(15,2) DEFAULT 0.00,
  `expected_closing_cash` decimal(15,2) DEFAULT 0.00,
  `actual_closing_cash` decimal(15,2) DEFAULT 0.00,
  `variance` decimal(15,2) DEFAULT 0.00,
  `status` enum('OPEN','CLOSED','RECONCILED') DEFAULT 'OPEN',
  `closed_by` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `business_days`
--

INSERT INTO `business_days` (`id`, `branch_id`, `business_date`, `opened_at`, `closed_at`, `opening_float`, `expected_closing_cash`, `actual_closing_cash`, `variance`, `status`, `closed_by`, `notes`, `created_at`) VALUES
('BD-444286-0001', 1, '2026-01-02', '2026-01-02 04:00:00', NULL, 500000.00, 0.00, 0.00, 0.00, 'OPEN', NULL, NULL, '2026-01-02 09:34:04');

-- --------------------------------------------------------

--
-- Table structure for table `cashbook_entries`
--

CREATE TABLE `cashbook_entries` (
  `id` varchar(50) NOT NULL,
  `business_id` int(11) NOT NULL,
  `business_day_id` varchar(50) DEFAULT NULL,
  `staff_cash_session_id` varchar(50) DEFAULT NULL,
  `branch_id` int(11) NOT NULL,
  `entry_type` enum('IN','OUT') NOT NULL,
  `source` enum('SALE','PAYMENT','REFUND','EXPENSE','FLOAT','OTHER') NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `reference_id` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cashbook_entries`
--

INSERT INTO `cashbook_entries` (`id`, `business_id`, `business_day_id`, `staff_cash_session_id`, `branch_id`, `entry_type`, `source`, `amount`, `reference_id`, `description`, `created_at`) VALUES
('CB-444727-0001', 1, 'BD-444286-0001', 'SCS-444299-0001', 1, 'IN', 'FLOAT', 200000.00, 'SCS-444299-0001', 'Opening float', '2026-01-02 09:34:04'),
('CB-444727-0002', 1, 'BD-444286-0001', 'SCS-444299-0001', 1, 'IN', 'SALE', 1500000.00, 'SAL-444347-0001', 'Cash payment', '2026-01-02 09:34:04'),
('CB-444727-0003', 1, 'BD-444286-0001', 'SCS-444299-0001', 1, 'IN', 'SALE', 3000000.00, 'SAL-444347-0002', 'MOMO payment', '2026-01-02 09:34:04'),
('CB-444727-0004', 1, 'BD-444286-0001', 'SCS-444299-0001', 1, 'IN', 'SALE', 6000000.00, 'SAL-444347-0004', 'Card payment', '2026-01-02 09:34:04');

-- --------------------------------------------------------

--
-- Table structure for table `commission_earned`
--

CREATE TABLE `commission_earned` (
  `id` varchar(50) NOT NULL,
  `business_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `sale_id` varchar(50) NOT NULL,
  `commission_amount` decimal(15,2) NOT NULL,
  `period` varchar(7) NOT NULL,
  `paid` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `commission_earned`
--

INSERT INTO `commission_earned` (`id`, `business_id`, `user_id`, `sale_id`, `commission_amount`, `period`, `paid`, `created_at`) VALUES
('COM-445026-0001', 1, 8, 'SAL-444347-0004', 120000.00, '2026-01', 0, '2026-01-02 09:34:05'),
('COM-445026-0002', 1, 3, 'SAL-444347-0001', 30000.00, '2026-01', 0, '2026-01-02 09:34:05');

-- --------------------------------------------------------

--
-- Table structure for table `commission_rules`
--

CREATE TABLE `commission_rules` (
  `id` int(11) NOT NULL,
  `business_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `commission_type` enum('PERCENTAGE','FIXED_PER_SALE') NOT NULL,
  `commission_value` decimal(15,2) NOT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `commission_rules`
--

INSERT INTO `commission_rules` (`id`, `business_id`, `name`, `commission_type`, `commission_value`, `active`, `created_at`) VALUES
(1, 1, 'Sales Staff Commission', 'PERCENTAGE', 2.00, 1, '2026-01-02 09:34:05'),
(2, 1, 'Manager Bonus', 'PERCENTAGE', 1.00, 1, '2026-01-02 09:34:05');

-- --------------------------------------------------------

--
-- Table structure for table `currencies`
--

CREATE TABLE `currencies` (
  `id` int(11) NOT NULL,
  `code` varchar(3) NOT NULL,
  `name` varchar(100) NOT NULL,
  `symbol` varchar(10) DEFAULT NULL,
  `exchange_rate` decimal(12,6) DEFAULT 1.000000,
  `is_base` tinyint(1) DEFAULT 0,
  `active` tinyint(1) DEFAULT 1,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `currencies`
--

INSERT INTO `currencies` (`id`, `code`, `name`, `symbol`, `exchange_rate`, `is_base`, `active`, `last_updated`) VALUES
(1, 'RWF', 'Rwandan Franc', 'FRw', 1.000000, 1, 1, '2026-01-02 09:34:03'),
(2, 'USD', 'US Dollar', '$', 0.001000, 0, 1, '2026-01-02 09:34:03'),
(3, 'EUR', 'Euro', '€', 0.000900, 0, 1, '2026-01-02 09:34:03'),
(4, 'KES', 'Kenyan Shilling', 'KSh', 0.130000, 0, 1, '2026-01-02 09:34:03');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `business_id` int(11) NOT NULL,
  `customer_group_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `tin` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `credit_allowed` tinyint(1) DEFAULT 0,
  `credit_limit` decimal(15,2) DEFAULT 0.00,
  `credit_terms` int(11) DEFAULT 30,
  `current_balance` decimal(15,2) DEFAULT 0.00,
  `total_purchases` decimal(15,2) DEFAULT 0.00,
  `credit_score` enum('EXCELLENT','GOOD','FAIR','POOR','BLOCKED') DEFAULT 'GOOD',
  `last_payment_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `business_id`, `customer_group_id`, `name`, `phone`, `email`, `tin`, `address`, `credit_allowed`, `credit_limit`, `credit_terms`, `current_balance`, `total_purchases`, `credit_score`, `last_payment_date`, `notes`, `active`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'Walk-in Customer', NULL, NULL, NULL, NULL, 0, 0.00, 0, 0.00, 0.00, 'GOOD', NULL, NULL, 1, '2026-01-02 09:34:04', '2026-01-02 09:34:04'),
(2, 1, 4, 'ABC Corporation Ltd', '+250788123456', 'accounts@abc.rw', NULL, NULL, 1, 5000000.00, 30, 0.00, 0.00, 'EXCELLENT', NULL, NULL, 1, '2026-01-02 09:34:04', '2026-01-02 09:34:04'),
(3, 1, 4, 'XYZ Enterprises', '+250788987654', 'info@xyz.rw', NULL, NULL, 1, 3000000.00, 45, 0.00, 0.00, 'GOOD', NULL, NULL, 1, '2026-01-02 09:34:04', '2026-01-02 09:34:04'),
(4, 1, 2, 'Prime Stores', '+250788555777', 'prime@stores.rw', NULL, NULL, 1, 2000000.00, 30, 0.00, 0.00, 'GOOD', NULL, NULL, 1, '2026-01-02 09:34:04', '2026-01-02 09:34:04'),
(5, 1, 1, 'Individual Customer', '+250788666888', 'customer@email.com', NULL, NULL, 0, 0.00, 0, 0.00, 0.00, 'GOOD', NULL, NULL, 1, '2026-01-02 09:34:04', '2026-01-02 09:34:04');

-- --------------------------------------------------------

--
-- Table structure for table `customer_groups`
--

CREATE TABLE `customer_groups` (
  `id` int(11) NOT NULL,
  `business_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `discount_percentage` decimal(5,2) DEFAULT 0.00,
  `credit_limit_multiplier` decimal(5,2) DEFAULT 1.00,
  `description` text DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customer_groups`
--

INSERT INTO `customer_groups` (`id`, `business_id`, `name`, `discount_percentage`, `credit_limit_multiplier`, `description`, `active`, `created_at`) VALUES
(1, 1, 'Retail', 0.00, 1.00, 'Walk-in retail customers', 1, '2026-01-02 09:34:04'),
(2, 1, 'Wholesale', 10.00, 1.00, 'Bulk buyers - 10% discount', 1, '2026-01-02 09:34:04'),
(3, 1, 'VIP', 15.00, 1.00, 'Premium customers - 15% discount', 1, '2026-01-02 09:34:04'),
(4, 1, 'Corporate', 12.00, 1.00, 'Corporate accounts', 1, '2026-01-02 09:34:04');

-- --------------------------------------------------------

--
-- Table structure for table `customer_loyalty_points`
--

CREATE TABLE `customer_loyalty_points` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `loyalty_program_id` int(11) NOT NULL,
  `points_earned` int(11) DEFAULT 0,
  `points_redeemed` int(11) DEFAULT 0,
  `points_balance` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customer_loyalty_points`
--

INSERT INTO `customer_loyalty_points` (`id`, `customer_id`, `loyalty_program_id`, `points_earned`, `points_redeemed`, `points_balance`, `created_at`) VALUES
(1, 2, 1, 10000, 2000, 8000, '2026-01-02 09:34:04'),
(2, 3, 1, 5000, 500, 4500, '2026-01-02 09:34:04'),
(3, 4, 1, 3000, 0, 3000, '2026-01-02 09:34:04');

-- --------------------------------------------------------

--
-- Table structure for table `customer_statements`
--

CREATE TABLE `customer_statements` (
  `id` varchar(50) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `transaction_date` date NOT NULL,
  `transaction_type` enum('SALE','PAYMENT','REFUND','ADJUSTMENT') NOT NULL,
  `reference_id` varchar(50) DEFAULT NULL,
  `debit` decimal(15,2) DEFAULT 0.00,
  `credit` decimal(15,2) DEFAULT 0.00,
  `balance` decimal(15,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `deliveries`
--

CREATE TABLE `deliveries` (
  `id` varchar(50) NOT NULL,
  `business_id` int(11) NOT NULL,
  `sale_id` varchar(50) NOT NULL,
  `delivery_zone_id` int(11) DEFAULT NULL,
  `delivery_address` text NOT NULL,
  `delivery_fee` decimal(15,2) DEFAULT 0.00,
  `delivery_date` date DEFAULT NULL,
  `driver_id` int(11) DEFAULT NULL,
  `status` enum('PENDING','DISPATCHED','DELIVERED','FAILED') DEFAULT 'PENDING',
  `tracking_number` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `deliveries`
--

INSERT INTO `deliveries` (`id`, `business_id`, `sale_id`, `delivery_zone_id`, `delivery_address`, `delivery_fee`, `delivery_date`, `driver_id`, `status`, `tracking_number`, `created_at`) VALUES
('DEL-444994-0001', 1, 'SAL-444347-0003', 1, 'KN 10 Ave, Nyarugenge, Kigali', 5000.00, '2026-01-02', 7, 'DELIVERED', 'TRK-2025-001', '2026-01-02 09:34:04');

-- --------------------------------------------------------

--
-- Table structure for table `delivery_zones`
--

CREATE TABLE `delivery_zones` (
  `id` int(11) NOT NULL,
  `business_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `delivery_fee` decimal(15,2) NOT NULL,
  `estimated_days` int(11) DEFAULT 1,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `delivery_zones`
--

INSERT INTO `delivery_zones` (`id`, `business_id`, `name`, `delivery_fee`, `estimated_days`, `active`, `created_at`) VALUES
(1, 1, 'Kigali City Center', 5000.00, 1, 1, '2026-01-02 09:34:04'),
(2, 1, 'Kigali Suburbs', 10000.00, 1, 1, '2026-01-02 09:34:04'),
(3, 1, 'Outside Kigali', 20000.00, 2, 1, '2026-01-02 09:34:04');

-- --------------------------------------------------------

--
-- Table structure for table `depreciation_entries`
--

CREATE TABLE `depreciation_entries` (
  `id` varchar(50) NOT NULL,
  `asset_id` varchar(50) NOT NULL,
  `period` varchar(7) NOT NULL,
  `depreciation_amount` decimal(15,2) NOT NULL,
  `accumulated_depreciation` decimal(15,2) NOT NULL,
  `book_value` decimal(15,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `business_id` int(11) NOT NULL,
  `employee_number` varchar(50) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `tin` varchar(50) DEFAULT NULL,
  `position` varchar(100) DEFAULT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `basic_salary` decimal(15,2) NOT NULL,
  `hire_date` date NOT NULL,
  `status` enum('ACTIVE','TERMINATED') DEFAULT 'ACTIVE',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `user_id`, `business_id`, `employee_number`, `full_name`, `tin`, `position`, `branch_id`, `basic_salary`, `hire_date`, `status`, `created_at`) VALUES
(1, 3, 1, 'EMP-001', 'Mike Johnson', 'TIN-EMP-001', 'Senior Cashier', 1, 300000.00, '2023-01-15', 'ACTIVE', '2026-01-02 09:34:04'),
(2, 4, 1, 'EMP-002', 'Sarah Williams', 'TIN-EMP-002', 'Store Keeper', 1, 350000.00, '2023-02-01', 'ACTIVE', '2026-01-02 09:34:04'),
(3, 6, 1, 'EMP-003', 'Emma Davis', 'TIN-EMP-003', 'Receptionist', 2, 280000.00, '2023-03-10', 'ACTIVE', '2026-01-02 09:34:04'),
(4, 7, 1, 'EMP-004', 'James Wilson', 'TIN-EMP-004', 'Delivery Driver', 1, 250000.00, '2023-04-05', 'ACTIVE', '2026-01-02 09:34:04'),
(5, 8, 1, 'EMP-005', 'Lisa Anderson', 'TIN-EMP-005', 'Sales Representative', 1, 320000.00, '2023-05-20', 'ACTIVE', '2026-01-02 09:34:04');

-- --------------------------------------------------------

--
-- Table structure for table `exchange_rate_history`
--

CREATE TABLE `exchange_rate_history` (
  `id` int(11) NOT NULL,
  `currency_code` varchar(3) NOT NULL,
  `rate` decimal(12,6) NOT NULL,
  `effective_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` varchar(50) NOT NULL,
  `business_id` int(11) NOT NULL,
  `branch_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `expense_date` date NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `vat_amount` decimal(15,2) DEFAULT 0.00,
  `payment_method` enum('CASH','BANK_TRANSFER','CARD','MOMO') NOT NULL,
  `payee` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('DRAFT','APPROVED','PAID') DEFAULT 'DRAFT',
  `approved_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `expenses`
--

INSERT INTO `expenses` (`id`, `business_id`, `branch_id`, `category_id`, `expense_date`, `amount`, `vat_amount`, `payment_method`, `payee`, `description`, `status`, `approved_by`, `created_at`) VALUES
('EXP-444818-0001', 1, 1, 1, '2026-01-02', 500000.00, 90000.00, 'BANK_TRANSFER', 'Kigali Property Management', 'Monthly rent for Downtown store', 'PAID', 2, '2026-01-02 09:34:04'),
('EXP-444818-0002', 1, 1, 4, '2026-01-02', 150000.00, 27000.00, 'CASH', 'Office Depot Rwanda', 'Stationery and supplies', 'PAID', 2, '2026-01-02 09:34:04');

-- --------------------------------------------------------

--
-- Table structure for table `expense_categories`
--

CREATE TABLE `expense_categories` (
  `id` int(11) NOT NULL,
  `business_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(20) DEFAULT NULL,
  `is_tax_deductible` tinyint(1) DEFAULT 1,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `expense_categories`
--

INSERT INTO `expense_categories` (`id`, `business_id`, `name`, `code`, `is_tax_deductible`, `active`, `created_at`) VALUES
(1, 1, 'Rent & Utilities', 'EXP-RENT', 1, 1, '2026-01-02 09:34:04'),
(2, 1, 'Salaries & Wages', 'EXP-SAL', 1, 1, '2026-01-02 09:34:04'),
(3, 1, 'Marketing & Advertising', 'EXP-MKTG', 1, 1, '2026-01-02 09:34:04'),
(4, 1, 'Office Supplies', 'EXP-SUPP', 1, 1, '2026-01-02 09:34:04'),
(5, 1, 'Transportation', 'EXP-TRANS', 1, 1, '2026-01-02 09:34:04'),
(6, 1, 'Bank Charges', 'EXP-BANK', 1, 1, '2026-01-02 09:34:04');

-- --------------------------------------------------------

--
-- Table structure for table `income_tax_entries`
--

CREATE TABLE `income_tax_entries` (
  `id` varchar(50) NOT NULL,
  `business_id` int(11) NOT NULL,
  `period` varchar(7) NOT NULL,
  `fiscal_year` int(11) NOT NULL,
  `gross_revenue` decimal(15,2) NOT NULL,
  `total_expenses` decimal(15,2) DEFAULT 0.00,
  `taxable_income` decimal(15,2) NOT NULL,
  `tax_rate` decimal(5,2) NOT NULL,
  `tax_amount` decimal(15,2) NOT NULL,
  `status` enum('DRAFT','FILED','PAID') DEFAULT 'DRAFT',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventory_forecast`
--

CREATE TABLE `inventory_forecast` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `variant_id` int(11) DEFAULT NULL,
  `warehouse_id` int(11) NOT NULL,
  `forecasted_demand_next_period` decimal(15,3) DEFAULT NULL,
  `suggested_order_quantity` decimal(15,3) DEFAULT NULL,
  `forecast_period` varchar(7) DEFAULT NULL,
  `confidence_score` decimal(5,2) DEFAULT NULL,
  `calculated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `alert_flag` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `inventory_forecast`
--

INSERT INTO `inventory_forecast` (`id`, `product_id`, `variant_id`, `warehouse_id`, `forecasted_demand_next_period`, `suggested_order_quantity`, `forecast_period`, `confidence_score`, `calculated_at`, `alert_flag`) VALUES
(1, 1, NULL, 1, 35.000, 20.000, '2026-01', NULL, '2026-01-02 09:34:05', 1),
(2, 2, NULL, 1, 25.000, 15.000, '2026-01', NULL, '2026-01-02 09:34:05', 1),
(3, 4, NULL, 1, 200.000, 100.000, '2026-01', NULL, '2026-01-02 09:34:05', 0),
(4, 5, NULL, 1, 350.000, 150.000, '2026-01', NULL, '2026-01-02 09:34:05', 0);

-- --------------------------------------------------------

--
-- Table structure for table `inventory_movements`
--

CREATE TABLE `inventory_movements` (
  `id` varchar(50) NOT NULL,
  `product_id` int(11) NOT NULL,
  `variant_id` int(11) DEFAULT NULL,
  `warehouse_id` int(11) NOT NULL,
  `movement_type` enum('PURCHASE','SALE','ADJUSTMENT','TRANSFER_OUT','TRANSFER_IN','RETURN','DAMAGE','COUNT') NOT NULL,
  `quantity_in` decimal(15,3) DEFAULT 0.000,
  `quantity_out` decimal(15,3) DEFAULT 0.000,
  `batch_id` varchar(50) DEFAULT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` varchar(50) DEFAULT NULL,
  `cost_price` decimal(15,2) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `inventory_movements`
--

INSERT INTO `inventory_movements` (`id`, `product_id`, `variant_id`, `warehouse_id`, `movement_type`, `quantity_in`, `quantity_out`, `batch_id`, `reference_type`, `reference_id`, `cost_price`, `notes`, `created_by`, `created_at`) VALUES
('INV-444708-0003', 4, NULL, 1, 'SALE', 0.000, 10.000, NULL, 'SALE', 'SAL-444347-0002', NULL, 'POS Sale', 3, '2026-01-02 09:34:04'),
('INV-444708-0004', 1, NULL, 1, 'PURCHASE', 30.000, 0.000, NULL, 'PURCHASE_INVOICE', 'PI-444188-0001', NULL, 'Purchase received', 4, '2026-01-02 09:34:04');

-- --------------------------------------------------------

--
-- Table structure for table `inventory_stock`
--

CREATE TABLE `inventory_stock` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `variant_id` int(11) DEFAULT NULL,
  `warehouse_id` int(11) NOT NULL,
  `quantity` decimal(15,3) DEFAULT 0.000,
  `reserved_quantity` decimal(15,3) DEFAULT 0.000,
  `last_counted_at` timestamp NULL DEFAULT NULL,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `inventory_stock`
--

INSERT INTO `inventory_stock` (`id`, `product_id`, `variant_id`, `warehouse_id`, `quantity`, `reserved_quantity`, `last_counted_at`, `last_updated`) VALUES
(1, 1, NULL, 1, 25.000, 0.000, NULL, '2026-01-02 09:34:04'),
(2, 2, NULL, 1, 15.000, 0.000, NULL, '2026-01-02 09:34:04'),
(3, 3, NULL, 1, 30.000, 0.000, NULL, '2026-01-02 09:34:04'),
(4, 4, NULL, 1, 150.000, 0.000, NULL, '2026-01-02 09:34:04'),
(5, 5, NULL, 1, 400.000, 0.000, NULL, '2026-01-02 09:34:04'),
(6, 6, NULL, 1, 45.000, 0.000, NULL, '2026-01-02 09:34:04'),
(7, 7, NULL, 1, 60.000, 0.000, NULL, '2026-01-02 09:34:04'),
(8, 8, NULL, 1, 20.000, 0.000, NULL, '2026-01-02 09:34:04'),
(9, 9, NULL, 1, 35.000, 0.000, NULL, '2026-01-02 09:34:04'),
(10, 10, NULL, 1, 18.000, 0.000, NULL, '2026-01-02 09:34:04'),
(11, 1, NULL, 2, 10.000, 0.000, NULL, '2026-01-02 09:34:04'),
(12, 2, NULL, 2, 8.000, 0.000, NULL, '2026-01-02 09:34:04'),
(13, 4, NULL, 2, 80.000, 0.000, NULL, '2026-01-02 09:34:04'),
(14, 5, NULL, 2, 200.000, 0.000, NULL, '2026-01-02 09:34:04'),
(15, 7, NULL, 2, 25.000, 0.000, NULL, '2026-01-02 09:34:04');

-- --------------------------------------------------------

--
-- Table structure for table `loans`
--

CREATE TABLE `loans` (
  `id` varchar(50) NOT NULL,
  `business_id` int(11) NOT NULL,
  `loan_type` enum('BANK_LOAN','SUPPLIER_CREDIT','PERSONAL_LOAN') NOT NULL,
  `lender_name` varchar(255) NOT NULL,
  `principal_amount` decimal(15,2) NOT NULL,
  `interest_rate` decimal(5,2) NOT NULL,
  `loan_start_date` date NOT NULL,
  `loan_end_date` date NOT NULL,
  `outstanding_balance` decimal(15,2) DEFAULT NULL,
  `status` enum('ACTIVE','PAID_OFF') DEFAULT 'ACTIVE',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `loans`
--

INSERT INTO `loans` (`id`, `business_id`, `loan_type`, `lender_name`, `principal_amount`, `interest_rate`, `loan_start_date`, `loan_end_date`, `outstanding_balance`, `status`, `created_at`) VALUES
('LOAN-444893-0001', 1, 'BANK_LOAN', 'Bank of Kigali', 20000000.00, 12.50, '2024-01-01', '2026-12-31', 15000000.00, 'ACTIVE', '2026-01-02 09:34:04');

-- --------------------------------------------------------

--
-- Table structure for table `loan_payments`
--

CREATE TABLE `loan_payments` (
  `id` varchar(50) NOT NULL,
  `loan_id` varchar(50) NOT NULL,
  `payment_date` date NOT NULL,
  `principal_paid` decimal(15,2) NOT NULL,
  `interest_paid` decimal(15,2) NOT NULL,
  `total_payment` decimal(15,2) NOT NULL,
  `outstanding_after_payment` decimal(15,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `loan_payments`
--

INSERT INTO `loan_payments` (`id`, `loan_id`, `payment_date`, `principal_paid`, `interest_paid`, `total_payment`, `outstanding_after_payment`, `created_at`) VALUES
('LP-444910-0001', 'LOAN-444893-0001', '2026-01-02', 500000.00, 150000.00, 650000.00, 15000000.00, '2026-01-02 09:34:04');

-- --------------------------------------------------------

--
-- Table structure for table `loyalty_programs`
--

CREATE TABLE `loyalty_programs` (
  `id` int(11) NOT NULL,
  `business_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `points_per_currency` decimal(10,2) DEFAULT 1.00,
  `redemption_rate` decimal(10,2) DEFAULT 100.00,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `loyalty_programs`
--

INSERT INTO `loyalty_programs` (`id`, `business_id`, `name`, `points_per_currency`, `redemption_rate`, `active`, `created_at`) VALUES
(1, 1, 'TechRetail Rewards', 1.00, 100.00, 1, '2026-01-02 09:34:04');

-- --------------------------------------------------------

--
-- Table structure for table `loyalty_transactions`
--

CREATE TABLE `loyalty_transactions` (
  `id` varchar(50) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `transaction_type` enum('EARN','REDEEM','EXPIRE','ADJUSTMENT') NOT NULL,
  `points` int(11) NOT NULL,
  `reference_id` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) NOT NULL,
  `business_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `notif_type` enum('LOW_STOCK','OVERDUE_PAYMENT','CASH_VARIANCE','SYSTEM_ALERT','APPROVAL_REQUEST') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `reference_id` varchar(50) DEFAULT NULL,
  `priority` enum('LOW','MEDIUM','HIGH','CRITICAL') DEFAULT 'MEDIUM',
  `read_status` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `business_id`, `user_id`, `notif_type`, `title`, `message`, `reference_id`, `priority`, `read_status`, `created_at`) VALUES
(1, 1, 4, 'LOW_STOCK', 'Low Stock Alert', 'Product \"USB-C Cable\" is below reorder point', NULL, 'HIGH', 0, '2026-01-02 09:34:05'),
(2, 1, 5, 'OVERDUE_PAYMENT', 'Payment Overdue', 'Invoice from Tech Distributors Ltd is overdue', NULL, 'HIGH', 0, '2026-01-02 09:34:05'),
(3, 1, 2, 'CASH_VARIANCE', 'Cash Variance Detected', 'Cash session has variance of 5000 RWF', NULL, 'MEDIUM', 0, '2026-01-02 09:34:05'),
(4, 1, 1, 'SYSTEM_ALERT', 'Daily Report Ready', 'Your daily sales report is ready for review', NULL, 'LOW', 0, '2026-01-02 09:34:05');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` varchar(50) NOT NULL,
  `business_id` int(11) NOT NULL,
  `sale_id` varchar(50) NOT NULL,
  `payment_date` date NOT NULL,
  `method` enum('CASH','MOMO','CARD','BANK_TRANSFER','CHECK') NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `currency` varchar(3) DEFAULT 'RWF',
  `reference_number` varchar(100) DEFAULT NULL,
  `received_by` int(11) DEFAULT NULL,
  `received_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `business_id`, `sale_id`, `payment_date`, `method`, `amount`, `currency`, `reference_number`, `received_by`, `received_at`) VALUES
('PAY-444630-0001', 1, 'SAL-444347-0001', '2026-01-02', 'CASH', 1500000.00, 'RWF', NULL, 3, '2026-01-02 09:34:04'),
('PAY-444630-0002', 1, 'SAL-444347-0002', '2026-01-02', 'MOMO', 3000000.00, 'RWF', 'MOMO-TXN-789456', 3, '2026-01-02 09:34:04'),
('PAY-444630-0003', 1, 'SAL-444347-0004', '2026-01-02', 'CARD', 6000000.00, 'RWF', 'CARD-AUTH-951753', 8, '2026-01-02 09:34:04');

-- --------------------------------------------------------

--
-- Table structure for table `payroll`
--

CREATE TABLE `payroll` (
  `id` varchar(50) NOT NULL,
  `business_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `period` varchar(7) NOT NULL,
  `payment_date` date NOT NULL,
  `basic_salary` decimal(15,2) NOT NULL,
  `gross_salary` decimal(15,2) NOT NULL,
  `paye_tax` decimal(15,2) DEFAULT 0.00,
  `social_security` decimal(15,2) DEFAULT 0.00,
  `total_deductions` decimal(15,2) NOT NULL,
  `net_salary` decimal(15,2) NOT NULL,
  `status` enum('DRAFT','APPROVED','PAID') DEFAULT 'DRAFT',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payroll`
--

INSERT INTO `payroll` (`id`, `business_id`, `employee_id`, `period`, `payment_date`, `basic_salary`, `gross_salary`, `paye_tax`, `social_security`, `total_deductions`, `net_salary`, `status`, `created_at`) VALUES
('PAY-444860-0001', 1, 1, '2026-01', '2026-01-02', 300000.00, 300000.00, 30000.00, 9000.00, 39000.00, 261000.00, 'PAID', '2026-01-02 09:34:04'),
('PAY-444860-0002', 1, 2, '2026-01', '2026-01-02', 350000.00, 350000.00, 40000.00, 10500.00, 50500.00, 299500.00, 'PAID', '2026-01-02 09:34:04');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `business_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `barcode` varchar(100) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `subcategory` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `has_variants` tinyint(1) DEFAULT 0,
  `vat_applicable` tinyint(1) DEFAULT 1,
  `vat_rate` decimal(5,2) DEFAULT 18.00,
  `sale_price` decimal(15,2) NOT NULL,
  `cost_price` decimal(15,2) DEFAULT NULL,
  `stock_unit` enum('PCS','KG','G','L','ML','M','CM','BOX','PACK') DEFAULT 'PCS',
  `min_stock_level` decimal(15,3) DEFAULT 0.000,
  `max_stock_level` decimal(15,3) DEFAULT 0.000,
  `reorder_point` decimal(15,3) DEFAULT 0.000,
  `suggested_reorder_quantity` decimal(15,3) DEFAULT 0.000,
  `track_serial` tinyint(1) DEFAULT 0,
  `track_batch` tinyint(1) DEFAULT 0,
  `image_url` varchar(500) DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `business_id`, `name`, `sku`, `barcode`, `category`, `subcategory`, `description`, `has_variants`, `vat_applicable`, `vat_rate`, `sale_price`, `cost_price`, `stock_unit`, `min_stock_level`, `max_stock_level`, `reorder_point`, `suggested_reorder_quantity`, `track_serial`, `track_batch`, `image_url`, `active`, `created_at`, `updated_at`) VALUES
(1, 1, 'Laptop Dell XPS 13', 'SKU-LAP-001', 'BAR-123456789', 'Electronics', NULL, NULL, 0, 1, 18.00, 1500000.00, 1200000.00, 'PCS', 5.000, 0.000, 10.000, 15.000, 0, 0, NULL, 1, '2026-01-02 09:34:04', '2026-01-02 09:34:04'),
(2, 1, 'iPhone 15 Pro', 'SKU-PHN-001', 'BAR-987654321', 'Electronics', NULL, NULL, 0, 1, 18.00, 1800000.00, 1500000.00, 'PCS', 3.000, 0.000, 8.000, 12.000, 0, 0, NULL, 1, '2026-01-02 09:34:04', '2026-01-02 09:34:04'),
(3, 1, 'Samsung Galaxy S24', 'SKU-PHN-002', 'BAR-456789123', 'Electronics', NULL, NULL, 0, 1, 18.00, 1400000.00, 1150000.00, 'PCS', 5.000, 0.000, 10.000, 15.000, 0, 0, NULL, 1, '2026-01-02 09:34:04', '2026-01-02 09:34:04'),
(4, 1, 'Wireless Mouse Logitech', 'SKU-ACC-001', 'BAR-789123456', 'Accessories', NULL, NULL, 0, 1, 18.00, 35000.00, 25000.00, 'PCS', 20.000, 0.000, 30.000, 50.000, 0, 0, NULL, 1, '2026-01-02 09:34:04', '2026-01-02 09:34:04'),
(5, 1, 'USB-C Cable', 'SKU-ACC-002', 'BAR-321654987', 'Accessories', NULL, NULL, 0, 1, 18.00, 15000.00, 10000.00, 'PCS', 50.000, 0.000, 75.000, 100.000, 0, 0, NULL, 1, '2026-01-02 09:34:04', '2026-01-02 09:34:04'),
(6, 1, 'External Hard Drive 1TB', 'SKU-STR-001', 'BAR-147258369', 'Storage', NULL, NULL, 0, 1, 18.00, 180000.00, 140000.00, 'PCS', 10.000, 0.000, 15.000, 25.000, 0, 0, NULL, 1, '2026-01-02 09:34:04', '2026-01-02 09:34:04'),
(7, 1, 'Bluetooth Headphones', 'SKU-AUD-001', 'BAR-963852741', 'Audio', NULL, NULL, 0, 1, 18.00, 120000.00, 90000.00, 'PCS', 15.000, 0.000, 20.000, 30.000, 0, 0, NULL, 1, '2026-01-02 09:34:04', '2026-01-02 09:34:04'),
(8, 1, 'Office Chair Executive', 'SKU-FUR-001', 'BAR-159753486', 'Furniture', NULL, NULL, 0, 1, 18.00, 350000.00, 280000.00, 'PCS', 5.000, 0.000, 8.000, 12.000, 0, 0, NULL, 1, '2026-01-02 09:34:04', '2026-01-02 09:34:04'),
(9, 1, 'Keyboard Mechanical RGB', 'SKU-ACC-003', 'BAR-753951456', 'Accessories', NULL, NULL, 0, 1, 18.00, 85000.00, 65000.00, 'PCS', 10.000, 0.000, 15.000, 25.000, 0, 0, NULL, 1, '2026-01-02 09:34:04', '2026-01-02 09:34:04'),
(10, 1, 'Monitor 27 inch 4K', 'SKU-DSP-001', 'BAR-852963741', 'Display', NULL, NULL, 0, 1, 18.00, 450000.00, 360000.00, 'PCS', 8.000, 0.000, 12.000, 20.000, 0, 0, NULL, 1, '2026-01-02 09:34:04', '2026-01-02 09:34:04');

-- --------------------------------------------------------

--
-- Table structure for table `product_attributes`
--

CREATE TABLE `product_attributes` (
  `id` int(11) NOT NULL,
  `business_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `attribute_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attribute_values`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_batches`
--

CREATE TABLE `product_batches` (
  `id` varchar(50) NOT NULL,
  `product_id` int(11) NOT NULL,
  `variant_id` int(11) DEFAULT NULL,
  `warehouse_id` int(11) NOT NULL,
  `batch_number` varchar(100) NOT NULL,
  `manufacture_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `quantity` decimal(15,3) NOT NULL,
  `cost_price` decimal(15,2) DEFAULT NULL,
  `status` enum('ACTIVE','EXPIRED','RECALLED','SOLD_OUT') DEFAULT 'ACTIVE',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_exchanges`
--

CREATE TABLE `product_exchanges` (
  `id` varchar(50) NOT NULL,
  `refund_id` varchar(50) NOT NULL,
  `original_sale_id` varchar(50) NOT NULL,
  `new_sale_id` varchar(50) DEFAULT NULL,
  `returned_product_id` int(11) NOT NULL,
  `exchanged_product_id` int(11) NOT NULL,
  `price_difference` decimal(15,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_pricing_tiers`
--

CREATE TABLE `product_pricing_tiers` (
  `id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `variant_id` int(11) DEFAULT NULL,
  `customer_group_id` int(11) NOT NULL,
  `price` decimal(15,2) NOT NULL,
  `min_quantity` decimal(15,3) DEFAULT 1.000
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_variants`
--

CREATE TABLE `product_variants` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `variant_name` varchar(255) DEFAULT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `barcode` varchar(100) DEFAULT NULL,
  `attributes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attributes`)),
  `sale_price` decimal(15,2) DEFAULT NULL,
  `cost_price` decimal(15,2) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `promotions`
--

CREATE TABLE `promotions` (
  `id` varchar(50) NOT NULL,
  `business_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `promotion_type` enum('PERCENTAGE','FIXED_AMOUNT','BUY_X_GET_Y','BUNDLE') DEFAULT 'PERCENTAGE',
  `discount_value` decimal(15,2) DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `promotions`
--

INSERT INTO `promotions` (`id`, `business_id`, `name`, `promotion_type`, `discount_value`, `start_date`, `end_date`, `active`, `created_at`) VALUES
('PROMO-444941-0001', 1, 'New Year Electronics Sale', 'PERCENTAGE', 10.00, '2026-01-02', '2026-04-02', 1, '2026-01-02 09:34:04');

-- --------------------------------------------------------

--
-- Table structure for table `promotion_usage`
--

CREATE TABLE `promotion_usage` (
  `id` int(11) NOT NULL,
  `promotion_id` varchar(50) NOT NULL,
  `sale_id` varchar(50) NOT NULL,
  `discount_applied` decimal(15,2) NOT NULL,
  `applied_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchase_invoices`
--

CREATE TABLE `purchase_invoices` (
  `id` varchar(50) NOT NULL,
  `business_id` int(11) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `purchase_order_id` varchar(50) DEFAULT NULL,
  `invoice_number` varchar(100) DEFAULT NULL,
  `invoice_date` date NOT NULL,
  `due_date` date DEFAULT NULL,
  `total_excl_vat` decimal(15,2) NOT NULL,
  `vat_amount` decimal(15,2) DEFAULT 0.00,
  `withholding_tax_rate` decimal(5,2) DEFAULT 0.00,
  `withholding_tax_amount` decimal(15,2) DEFAULT 0.00,
  `import_duty` decimal(15,2) DEFAULT 0.00,
  `total_incl_vat` decimal(15,2) NOT NULL,
  `net_payable` decimal(15,2) DEFAULT NULL,
  `amount_paid` decimal(15,2) DEFAULT 0.00,
  `amount_remaining` decimal(15,2) DEFAULT NULL,
  `status` enum('DRAFT','UNPAID','PARTIAL','PAID','OVERDUE') DEFAULT 'UNPAID',
  `currency` varchar(3) DEFAULT 'RWF',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `purchase_invoices`
--

INSERT INTO `purchase_invoices` (`id`, `business_id`, `supplier_id`, `purchase_order_id`, `invoice_number`, `invoice_date`, `due_date`, `total_excl_vat`, `vat_amount`, `withholding_tax_rate`, `withholding_tax_amount`, `import_duty`, `total_incl_vat`, `net_payable`, `amount_paid`, `amount_remaining`, `status`, `currency`, `created_by`, `created_at`, `updated_at`) VALUES
('PI-444188-0001', 1, 1, 'PO-444158-0001', 'INV-TECH-2025-001', '2026-01-02', '2026-02-01', 50847457.63, 9152542.37, 3.00, 1525423.73, 0.00, 60000000.00, 58474576.27, 0.00, NULL, 'UNPAID', 'RWF', 2, '2026-01-02 09:34:04', '2026-01-02 09:34:04'),
('PI-444188-0002', 1, 2, 'PO-444158-0002', 'INV-GLOB-2025-045', '2026-01-02', '2026-02-16', 4237288.14, 762711.86, 3.00, 127118.64, 0.00, 5000000.00, 4872881.36, 0.00, NULL, 'PAID', 'RWF', 2, '2026-01-02 09:34:04', '2026-01-02 09:34:04');

-- --------------------------------------------------------

--
-- Table structure for table `purchase_invoice_items`
--

CREATE TABLE `purchase_invoice_items` (
  `id` int(11) NOT NULL,
  `purchase_invoice_id` varchar(50) NOT NULL,
  `product_id` int(11) NOT NULL,
  `variant_id` int(11) DEFAULT NULL,
  `batch_number` varchar(100) DEFAULT NULL,
  `quantity` decimal(15,3) NOT NULL,
  `unit_cost` decimal(15,2) NOT NULL,
  `line_total` decimal(15,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `purchase_invoice_items`
--

INSERT INTO `purchase_invoice_items` (`id`, `purchase_invoice_id`, `product_id`, `variant_id`, `batch_number`, `quantity`, `unit_cost`, `line_total`) VALUES
(1, 'PI-444188-0001', 1, NULL, NULL, 30.000, 1200000.00, 36000000.00),
(2, 'PI-444188-0001', 2, NULL, NULL, 20.000, 1500000.00, 30000000.00),
(3, 'PI-444188-0002', 4, NULL, NULL, 100.000, 25000.00, 2500000.00),
(4, 'PI-444188-0002', 5, NULL, NULL, 200.000, 10000.00, 2000000.00),
(5, 'PI-444188-0002', 7, NULL, NULL, 50.000, 90000.00, 4500000.00);

-- --------------------------------------------------------

--
-- Table structure for table `purchase_orders`
--

CREATE TABLE `purchase_orders` (
  `id` varchar(50) NOT NULL,
  `business_id` int(11) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `warehouse_id` int(11) NOT NULL,
  `order_number` varchar(100) DEFAULT NULL,
  `status` enum('DRAFT','PENDING','APPROVED','ORDERED','RECEIVED','CANCELLED') DEFAULT 'DRAFT',
  `order_date` date NOT NULL,
  `expected_date` date DEFAULT NULL,
  `received_date` date DEFAULT NULL,
  `total_amount` decimal(15,2) DEFAULT 0.00,
  `currency` varchar(3) DEFAULT 'RWF',
  `exchange_rate` decimal(12,6) DEFAULT 1.000000,
  `notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `purchase_orders`
--

INSERT INTO `purchase_orders` (`id`, `business_id`, `supplier_id`, `warehouse_id`, `order_number`, `status`, `order_date`, `expected_date`, `received_date`, `total_amount`, `currency`, `exchange_rate`, `notes`, `created_by`, `approved_by`, `created_at`, `updated_at`) VALUES
('PO-444158-0001', 1, 1, 1, 'PO-2025-001', 'APPROVED', '2026-01-02', '2026-02-01', NULL, 60000000.00, 'RWF', 1.000000, NULL, 2, NULL, '2026-01-02 09:34:04', '2026-01-02 09:34:04'),
('PO-444158-0002', 1, 2, 1, 'PO-2025-002', 'RECEIVED', '2026-01-02', '2026-01-02', NULL, 5000000.00, 'RWF', 1.000000, NULL, 2, NULL, '2026-01-02 09:34:04', '2026-01-02 09:34:04');

-- --------------------------------------------------------

--
-- Table structure for table `purchase_order_items`
--

CREATE TABLE `purchase_order_items` (
  `id` int(11) NOT NULL,
  `purchase_order_id` varchar(50) NOT NULL,
  `product_id` int(11) NOT NULL,
  `variant_id` int(11) DEFAULT NULL,
  `quantity` decimal(15,3) NOT NULL,
  `unit_cost` decimal(15,2) NOT NULL,
  `line_total` decimal(15,2) NOT NULL,
  `received_quantity` decimal(15,3) DEFAULT 0.000
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `purchase_order_items`
--

INSERT INTO `purchase_order_items` (`id`, `purchase_order_id`, `product_id`, `variant_id`, `quantity`, `unit_cost`, `line_total`, `received_quantity`) VALUES
(1, 'PO-444158-0001', 1, NULL, 30.000, 1200000.00, 36000000.00, 0.000),
(2, 'PO-444158-0001', 2, NULL, 20.000, 1500000.00, 30000000.00, 0.000),
(3, 'PO-444158-0002', 4, NULL, 100.000, 25000.00, 2500000.00, 0.000),
(4, 'PO-444158-0002', 5, NULL, 200.000, 10000.00, 2000000.00, 0.000),
(5, 'PO-444158-0002', 7, NULL, 50.000, 90000.00, 4500000.00, 0.000);

-- --------------------------------------------------------

--
-- Table structure for table `quotations`
--

CREATE TABLE `quotations` (
  `id` varchar(50) NOT NULL,
  `business_id` int(11) NOT NULL,
  `branch_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `quotation_number` varchar(100) DEFAULT NULL,
  `quotation_date` date NOT NULL,
  `valid_until` date DEFAULT NULL,
  `total_excl_vat` decimal(15,2) NOT NULL,
  `vat_amount` decimal(15,2) DEFAULT 0.00,
  `total_incl_vat` decimal(15,2) NOT NULL,
  `status` enum('DRAFT','SENT','ACCEPTED','REJECTED','EXPIRED') DEFAULT 'DRAFT',
  `currency` varchar(3) DEFAULT 'RWF',
  `notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quotation_items`
--

CREATE TABLE `quotation_items` (
  `id` int(11) NOT NULL,
  `quotation_id` varchar(50) NOT NULL,
  `product_id` int(11) NOT NULL,
  `variant_id` int(11) DEFAULT NULL,
  `quantity` decimal(15,3) NOT NULL,
  `unit_price` decimal(15,2) NOT NULL,
  `line_total` decimal(15,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `receivables`
--

CREATE TABLE `receivables` (
  `id` varchar(50) NOT NULL,
  `business_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `sale_id` varchar(50) NOT NULL,
  `amount_due` decimal(15,2) NOT NULL,
  `amount_paid` decimal(15,2) DEFAULT 0.00,
  `due_date` date DEFAULT NULL,
  `status` enum('OPEN','PARTIAL','PAID','OVERDUE') DEFAULT 'OPEN',
  `reminder_flag` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `receivables`
--

INSERT INTO `receivables` (`id`, `business_id`, `customer_id`, `sale_id`, `amount_due`, `amount_paid`, `due_date`, `status`, `reminder_flag`, `created_at`) VALUES
('REC-444655-0001', 1, 2, 'SAL-444347-0003', 10000000.00, 0.00, '2026-02-01', 'OPEN', 0, '2026-01-02 09:34:04');

-- --------------------------------------------------------

--
-- Table structure for table `refunds`
--

CREATE TABLE `refunds` (
  `id` varchar(50) NOT NULL,
  `business_id` int(11) NOT NULL,
  `original_sale_id` varchar(50) NOT NULL,
  `refund_type` enum('CASH_REFUND','CREDIT_NOTE','EXCHANGE') DEFAULT 'CASH_REFUND',
  `refund_date` date NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `vat_amount` decimal(15,2) DEFAULT 0.00,
  `reason` text DEFAULT NULL,
  `status` enum('PENDING','APPROVED','COMPLETED') DEFAULT 'PENDING',
  `approved_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `regulatory_payments`
--

CREATE TABLE `regulatory_payments` (
  `id` varchar(50) NOT NULL,
  `business_id` int(11) NOT NULL,
  `payment_type` enum('PROPERTY_TAX','BUSINESS_LICENSE','OTHER') NOT NULL,
  `description` varchar(255) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `due_date` date DEFAULT NULL,
  `status` enum('UNPAID','PAID') DEFAULT 'UNPAID',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales`
--

CREATE TABLE `sales` (
  `id` varchar(50) NOT NULL,
  `business_id` int(11) NOT NULL,
  `branch_id` int(11) NOT NULL,
  `warehouse_id` int(11) NOT NULL,
  `channel` enum('POS','FRONTDESK','ONLINE','PHONE') NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `sale_number` varchar(100) DEFAULT NULL,
  `sale_date` date NOT NULL,
  `total_excl_vat` decimal(15,2) NOT NULL,
  `vat_amount` decimal(15,2) DEFAULT 0.00,
  `total_incl_vat` decimal(15,2) NOT NULL,
  `discount_amount` decimal(15,2) DEFAULT 0.00,
  `grand_total` decimal(15,2) NOT NULL,
  `amount_paid` decimal(15,2) DEFAULT 0.00,
  `payment_status` enum('PAID','PARTIAL','UNPAID','CREDIT') DEFAULT 'PAID',
  `business_day_id` varchar(50) DEFAULT NULL,
  `currency` varchar(3) DEFAULT 'RWF',
  `notes` text DEFAULT NULL,
  `served_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sales`
--

INSERT INTO `sales` (`id`, `business_id`, `branch_id`, `warehouse_id`, `channel`, `customer_id`, `sale_number`, `sale_date`, `total_excl_vat`, `vat_amount`, `total_incl_vat`, `discount_amount`, `grand_total`, `amount_paid`, `payment_status`, `business_day_id`, `currency`, `notes`, `served_by`, `created_at`) VALUES
('SAL-444347-0001', 1, 1, 1, 'POS', 1, 'SAL-2025-0001', '2026-01-02', 1271186.44, 228813.56, 1500000.00, 0.00, 1500000.00, 1500000.00, 'PAID', 'BD-444286-0001', 'RWF', NULL, 3, '2026-01-02 09:34:04'),
('SAL-444347-0002', 1, 1, 1, 'POS', 5, 'SAL-2025-0002', '2026-01-02', 2542372.88, 457627.12, 3000000.00, 0.00, 3000000.00, 3000000.00, 'PAID', 'BD-444286-0001', 'RWF', NULL, 3, '2026-01-02 09:34:04'),
('SAL-444347-0003', 1, 1, 1, 'FRONTDESK', 2, 'SAL-2025-0003', '2026-01-02', 8474576.27, 1525423.73, 10000000.00, 0.00, 10000000.00, 0.00, 'CREDIT', 'BD-444286-0001', 'RWF', NULL, 6, '2026-01-02 09:34:04'),
('SAL-444347-0004', 1, 1, 1, 'POS', 1, 'SAL-2025-0004', '2026-01-02', 5084745.76, 915254.24, 6000000.00, 0.00, 6000000.00, 6000000.00, 'PAID', 'BD-444286-0001', 'RWF', NULL, 8, '2026-01-02 09:34:04');

-- --------------------------------------------------------

--
-- Table structure for table `sale_items`
--

CREATE TABLE `sale_items` (
  `id` int(11) NOT NULL,
  `sale_id` varchar(50) NOT NULL,
  `product_id` int(11) NOT NULL,
  `variant_id` int(11) DEFAULT NULL,
  `quantity` decimal(15,3) NOT NULL,
  `unit_price` decimal(15,2) NOT NULL,
  `discount` decimal(15,2) DEFAULT 0.00,
  `line_total` decimal(15,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sale_items`
--

INSERT INTO `sale_items` (`id`, `sale_id`, `product_id`, `variant_id`, `quantity`, `unit_price`, `discount`, `line_total`) VALUES
(1, 'SAL-444347-0001', 1, NULL, 1.000, 1500000.00, 0.00, 1500000.00),
(2, 'SAL-444347-0002', 2, NULL, 1.000, 1800000.00, 0.00, 1800000.00),
(3, 'SAL-444347-0002', 4, NULL, 10.000, 35000.00, 0.00, 350000.00),
(4, 'SAL-444347-0002', 5, NULL, 30.000, 15000.00, 0.00, 450000.00),
(5, 'SAL-444347-0002', 7, NULL, 20.000, 120000.00, 0.00, 2400000.00),
(6, 'SAL-444347-0003', 1, NULL, 5.000, 1500000.00, 0.00, 7500000.00),
(7, 'SAL-444347-0003', 6, NULL, 10.000, 180000.00, 0.00, 1800000.00),
(8, 'SAL-444347-0003', 4, NULL, 20.000, 35000.00, 0.00, 700000.00),
(9, 'SAL-444347-0004', 10, NULL, 10.000, 450000.00, 0.00, 4500000.00),
(10, 'SAL-444347-0004', 9, NULL, 15.000, 85000.00, 0.00, 1275000.00),
(11, 'SAL-444347-0004', 4, NULL, 5.000, 35000.00, 0.00, 175000.00);

-- --------------------------------------------------------

--
-- Table structure for table `serial_numbers`
--

CREATE TABLE `serial_numbers` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `variant_id` int(11) DEFAULT NULL,
  `serial_number` varchar(100) NOT NULL,
  `warehouse_id` int(11) DEFAULT NULL,
  `status` enum('IN_STOCK','SOLD','RETURNED','DEFECTIVE','WARRANTY') DEFAULT 'IN_STOCK',
  `sale_id` varchar(50) DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `warranty_expiry` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL,
  `business_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `price` decimal(15,2) NOT NULL,
  `vat_applicable` tinyint(1) DEFAULT 1,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`id`, `business_id`, `name`, `category`, `price`, `vat_applicable`, `active`, `created_at`) VALUES
(1, 1, 'Technical Support - 1 Hour', 'IT Services', 50000.00, 1, 1, '2026-01-02 09:34:04'),
(2, 1, 'Product Installation', 'Installation', 75000.00, 1, 1, '2026-01-02 09:34:04'),
(3, 1, 'Equipment Repair', 'Repair', 100000.00, 1, 1, '2026-01-02 09:34:04');

-- --------------------------------------------------------

--
-- Table structure for table `service_bookings`
--

CREATE TABLE `service_bookings` (
  `id` varchar(50) NOT NULL,
  `business_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `branch_id` int(11) NOT NULL,
  `booking_date` date NOT NULL,
  `booking_time` time NOT NULL,
  `status` enum('PENDING','CONFIRMED','COMPLETED','CANCELLED') DEFAULT 'PENDING',
  `amount` decimal(15,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `social_security_contributions`
--

CREATE TABLE `social_security_contributions` (
  `id` varchar(50) NOT NULL,
  `payroll_id` varchar(50) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `period` varchar(7) NOT NULL,
  `employee_contribution` decimal(15,2) NOT NULL,
  `employer_contribution` decimal(15,2) NOT NULL,
  `total_contribution` decimal(15,2) NOT NULL,
  `remittance_status` enum('PENDING','REMITTED') DEFAULT 'PENDING',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staff_cash_sessions`
--

CREATE TABLE `staff_cash_sessions` (
  `id` varchar(50) NOT NULL,
  `user_id` int(11) NOT NULL,
  `branch_id` int(11) NOT NULL,
  `business_day_id` varchar(50) DEFAULT NULL,
  `opening_float` decimal(15,2) DEFAULT 0.00,
  `closing_cash` decimal(15,2) DEFAULT 0.00,
  `variance` decimal(15,2) DEFAULT 0.00,
  `status` enum('OPEN','CLOSED') DEFAULT 'OPEN',
  `alert_flag` tinyint(1) DEFAULT 0,
  `opened_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `closed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `staff_cash_sessions`
--

INSERT INTO `staff_cash_sessions` (`id`, `user_id`, `branch_id`, `business_day_id`, `opening_float`, `closing_cash`, `variance`, `status`, `alert_flag`, `opened_at`, `closed_at`) VALUES
('SCS-444299-0001', 3, 1, 'BD-444286-0001', 200000.00, 0.00, 0.00, 'OPEN', 0, '2026-01-02 04:30:00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `stock_transfers`
--

CREATE TABLE `stock_transfers` (
  `id` varchar(50) NOT NULL,
  `from_warehouse_id` int(11) NOT NULL,
  `to_warehouse_id` int(11) NOT NULL,
  `status` enum('PENDING','APPROVED','IN_TRANSIT','RECEIVED','CANCELLED') DEFAULT 'PENDING',
  `requested_by` int(11) NOT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `shipped_by` int(11) DEFAULT NULL,
  `received_by` int(11) DEFAULT NULL,
  `transfer_date` date DEFAULT NULL,
  `expected_date` date DEFAULT NULL,
  `received_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stock_transfer_items`
--

CREATE TABLE `stock_transfer_items` (
  `id` int(11) NOT NULL,
  `transfer_id` varchar(50) NOT NULL,
  `product_id` int(11) NOT NULL,
  `variant_id` int(11) DEFAULT NULL,
  `batch_id` varchar(50) DEFAULT NULL,
  `quantity_requested` decimal(15,3) NOT NULL,
  `quantity_shipped` decimal(15,3) DEFAULT 0.000,
  `quantity_received` decimal(15,3) DEFAULT 0.000,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL,
  `business_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `tin` varchar(50) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `payment_terms` varchar(100) DEFAULT NULL,
  `credit_limit` decimal(15,2) DEFAULT 0.00,
  `current_balance` decimal(15,2) DEFAULT 0.00,
  `total_purchases` decimal(15,2) DEFAULT 0.00,
  `rating` enum('EXCELLENT','GOOD','AVERAGE','POOR') DEFAULT 'GOOD',
  `notes` text DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `business_id`, `name`, `tin`, `phone`, `email`, `address`, `payment_terms`, `credit_limit`, `current_balance`, `total_purchases`, `rating`, `notes`, `active`, `created_at`, `updated_at`) VALUES
(1, 1, 'Tech Distributors Ltd', 'SUP-TIN-111', '+250788111222', 'sales@techdist.rw', NULL, 'Net 30', 0.00, 0.00, 0.00, 'EXCELLENT', NULL, 1, '2026-01-02 09:34:04', '2026-01-02 09:34:04'),
(2, 1, 'Global Electronics Inc', 'SUP-TIN-222', '+250788333444', 'orders@global.com', NULL, 'Net 45', 0.00, 0.00, 0.00, 'GOOD', NULL, 1, '2026-01-02 09:34:04', '2026-01-02 09:34:04'),
(3, 1, 'Local Supplies Co', 'SUP-TIN-333', '+250788555777', 'info@localsupplies.rw', NULL, 'Net 15', 0.00, 0.00, 0.00, 'GOOD', NULL, 1, '2026-01-02 09:34:04', '2026-01-02 09:34:04'),
(4, 1, 'Premium Tech Imports', 'SUP-TIN-444', '+250788999000', 'imports@premtech.rw', NULL, 'Net 60', 0.00, 0.00, 0.00, 'EXCELLENT', NULL, 1, '2026-01-02 09:34:04', '2026-01-02 09:34:04');

-- --------------------------------------------------------

--
-- Table structure for table `supplier_payments`
--

CREATE TABLE `supplier_payments` (
  `id` varchar(50) NOT NULL,
  `business_id` int(11) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `purchase_invoice_id` varchar(50) DEFAULT NULL,
  `payment_date` date NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `payment_method` enum('CASH','BANK_TRANSFER','CHECK','MOMO') NOT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `currency` varchar(3) DEFAULT 'RWF',
  `notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `supplier_payments`
--

INSERT INTO `supplier_payments` (`id`, `business_id`, `supplier_id`, `purchase_invoice_id`, `payment_date`, `amount`, `payment_method`, `reference_number`, `currency`, `notes`, `created_by`, `created_at`) VALUES
('SP-444261-0001', 1, 2, 'PI-444188-0002', '2026-01-02', 4872881.36, 'BANK_TRANSFER', 'TXN-BANK-78945', 'RWF', NULL, 5, '2026-01-02 09:34:04');

-- --------------------------------------------------------

--
-- Table structure for table `tax_configurations`
--

CREATE TABLE `tax_configurations` (
  `id` int(11) NOT NULL,
  `business_id` int(11) NOT NULL,
  `tax_type` enum('VAT','INCOME_TAX','WITHHOLDING_TAX','PAYROLL_TAX') NOT NULL,
  `tax_name` varchar(100) NOT NULL,
  `rate` decimal(5,2) NOT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `role` enum('owner','manager','cashier','storekeeper','accountant','receptionist','driver','salesperson') NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `dashboard_preferences` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`dashboard_preferences`)),
  `active` tinyint(1) DEFAULT 1,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `phone`, `dashboard_preferences`, `active`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 'John Doe', 'john@techretail.rw', '$2a$10$GZdDs5R12UXLFefx1H3kTOz3d6Z0vqa76D2WAjkcpq98dRkijXgZK', 'owner', '+250788111001', NULL, 1, '2026-01-02 09:37:03', '2026-01-02 09:34:04', '2026-01-02 09:37:03'),
(2, 'Jane Smith', 'jane@techretail.rw', '$2a$10$GZdDs5R12UXLFefx1H3kTOz3d6Z0vqa76D2WAjkcpq98dRkijXgZK', 'manager', '+250788111002', NULL, 1, NULL, '2026-01-02 09:34:04', '2026-01-02 09:34:04'),
(3, 'Mike Johnson', 'mike@techretail.rw', '$2a$10$GZdDs5R12UXLFefx1H3kTOz3d6Z0vqa76D2WAjkcpq98dRkijXgZK', 'cashier', '+250788111003', NULL, 1, NULL, '2026-01-02 09:34:04', '2026-01-02 09:34:04'),
(4, 'Sarah Williams', 'sarah@techretail.rw', '$2a$10$GZdDs5R12UXLFefx1H3kTOz3d6Z0vqa76D2WAjkcpq98dRkijXgZK', 'storekeeper', '+250788111004', NULL, 1, NULL, '2026-01-02 09:34:04', '2026-01-02 09:34:04'),
(5, 'David Brown', 'david@techretail.rw', '$2a$10$GZdDs5R12UXLFefx1H3kTOz3d6Z0vqa76D2WAjkcpq98dRkijXgZK', 'accountant', '+250788111005', NULL, 1, NULL, '2026-01-02 09:34:04', '2026-01-02 09:34:04'),
(6, 'Emma Davis', 'emma@techretail.rw', '$2a$10$GZdDs5R12UXLFefx1H3kTOz3d6Z0vqa76D2WAjkcpq98dRkijXgZK', 'receptionist', '+250788111006', NULL, 1, NULL, '2026-01-02 09:34:04', '2026-01-02 09:34:04'),
(7, 'James Wilson', 'james@techretail.rw', '$2a$10$GZdDs5R12UXLFefx1H3kTOz3d6Z0vqa76D2WAjkcpq98dRkijXgZK', 'driver', '+250788111007', NULL, 1, NULL, '2026-01-02 09:34:04', '2026-01-02 09:34:04'),
(8, 'Lisa Anderson', 'lisa@techretail.rw', '$2a$10$GZdDs5R12UXLFefx1H3kTOz3d6Z0vqa76D2WAjkcpq98dRkijXgZK', 'salesperson', '+250788111008', NULL, 1, NULL, '2026-01-02 09:34:04', '2026-01-02 09:34:04');

-- --------------------------------------------------------

--
-- Table structure for table `user_branches`
--

CREATE TABLE `user_branches` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `branch_id` int(11) NOT NULL,
  `role` varchar(50) DEFAULT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_branches`
--

INSERT INTO `user_branches` (`id`, `user_id`, `branch_id`, `role`, `is_primary`, `created_at`) VALUES
(1, 1, 1, 'owner', 1, '2026-01-02 09:34:04'),
(2, 1, 2, 'owner', 0, '2026-01-02 09:34:04'),
(3, 1, 3, 'owner', 0, '2026-01-02 09:34:04'),
(4, 2, 1, 'branch_manager', 1, '2026-01-02 09:34:04'),
(5, 3, 1, 'cashier', 1, '2026-01-02 09:34:04'),
(6, 4, 1, 'warehouse_supervisor', 1, '2026-01-02 09:34:04'),
(7, 5, 1, 'head_accountant', 1, '2026-01-02 09:34:04'),
(8, 6, 2, 'front_desk', 1, '2026-01-02 09:34:04'),
(9, 7, 1, 'delivery_driver', 1, '2026-01-02 09:34:04'),
(10, 8, 1, 'sales_rep', 1, '2026-01-02 09:34:04');

-- --------------------------------------------------------

--
-- Table structure for table `vat_entries`
--

CREATE TABLE `vat_entries` (
  `id` varchar(50) NOT NULL,
  `business_id` int(11) NOT NULL,
  `entry_type` enum('INPUT','OUTPUT') NOT NULL,
  `source_type` enum('SALE','PURCHASE','REFUND') NOT NULL,
  `source_id` varchar(50) NOT NULL,
  `transaction_date` date NOT NULL,
  `taxable_amount` decimal(15,2) NOT NULL,
  `vat_amount` decimal(15,2) NOT NULL,
  `vat_rate` decimal(5,2) NOT NULL,
  `period` varchar(7) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vat_entries`
--

INSERT INTO `vat_entries` (`id`, `business_id`, `entry_type`, `source_type`, `source_id`, `transaction_date`, `taxable_amount`, `vat_amount`, `vat_rate`, `period`, `created_at`) VALUES
('VAT-444670-0001', 1, 'OUTPUT', 'SALE', 'SAL-444347-0001', '2026-01-02', 1271186.44, 228813.56, 18.00, '2026-01', '2026-01-02 09:34:04'),
('VAT-444670-0002', 1, 'OUTPUT', 'SALE', 'SAL-444347-0002', '2026-01-02', 2542372.88, 457627.12, 18.00, '2026-01', '2026-01-02 09:34:04'),
('VAT-444670-0003', 1, 'OUTPUT', 'SALE', 'SAL-444347-0003', '2026-01-02', 8474576.27, 1525423.73, 18.00, '2026-01', '2026-01-02 09:34:04'),
('VAT-444670-0004', 1, 'OUTPUT', 'SALE', 'SAL-444347-0004', '2026-01-02', 5084745.76, 915254.24, 18.00, '2026-01', '2026-01-02 09:34:04'),
('VAT-444670-0005', 1, 'INPUT', 'PURCHASE', 'PI-444188-0001', '2026-01-02', 50847457.63, 9152542.37, 18.00, '2026-01', '2026-01-02 09:34:04');

-- --------------------------------------------------------

--
-- Table structure for table `warehouses`
--

CREATE TABLE `warehouses` (
  `id` int(11) NOT NULL,
  `business_id` int(11) NOT NULL,
  `branch_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `warehouse_type` enum('MAIN','RETAIL','TRANSIT','COLD_STORAGE') DEFAULT 'MAIN',
  `address` text DEFAULT NULL,
  `capacity_sqm` decimal(10,2) DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `warehouses`
--

INSERT INTO `warehouses` (`id`, `business_id`, `branch_id`, `name`, `warehouse_type`, `address`, `capacity_sqm`, `active`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'Downtown Main Warehouse', 'MAIN', NULL, NULL, 1, '2026-01-02 09:34:04', '2026-01-02 09:34:04'),
(2, 1, 2, 'Airport Storage', 'RETAIL', NULL, NULL, 1, '2026-01-02 09:34:04', '2026-01-02 09:34:04'),
(3, 1, 3, 'Kimironko Warehouse', 'MAIN', NULL, NULL, 1, '2026-01-02 09:34:04', '2026-01-02 09:34:04');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `assets`
--
ALTER TABLE `assets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `business_id` (`business_id`),
  ADD KEY `branch_id` (`branch_id`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `business_id` (`business_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_table_record` (`table_name`,`record_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `bank_accounts`
--
ALTER TABLE `bank_accounts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `business_id` (`business_id`),
  ADD KEY `branch_id` (`branch_id`);

--
-- Indexes for table `bank_reconciliations`
--
ALTER TABLE `bank_reconciliations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bank_account_id` (`bank_account_id`),
  ADD KEY `reconciled_by` (`reconciled_by`);

--
-- Indexes for table `bank_transactions`
--
ALTER TABLE `bank_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_account_date` (`bank_account_id`,`transaction_date`);

--
-- Indexes for table `branches`
--
ALTER TABLE `branches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_business_id` (`business_id`),
  ADD KEY `idx_code` (`code`);

--
-- Indexes for table `business`
--
ALTER TABLE `business`
  ADD PRIMARY KEY (`id`),
  ADD KEY `base_currency` (`base_currency`);

--
-- Indexes for table `business_days`
--
ALTER TABLE `business_days`
  ADD PRIMARY KEY (`id`),
  ADD KEY `closed_by` (`closed_by`),
  ADD KEY `idx_branch_id` (`branch_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `cashbook_entries`
--
ALTER TABLE `cashbook_entries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `business_id` (`business_id`),
  ADD KEY `staff_cash_session_id` (`staff_cash_session_id`),
  ADD KEY `branch_id` (`branch_id`),
  ADD KEY `idx_business_day_id` (`business_day_id`);

--
-- Indexes for table `commission_earned`
--
ALTER TABLE `commission_earned`
  ADD PRIMARY KEY (`id`),
  ADD KEY `business_id` (`business_id`),
  ADD KEY `sale_id` (`sale_id`),
  ADD KEY `idx_user_period` (`user_id`,`period`);

--
-- Indexes for table `commission_rules`
--
ALTER TABLE `commission_rules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `business_id` (`business_id`);

--
-- Indexes for table `currencies`
--
ALTER TABLE `currencies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_code` (`code`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_group_id` (`customer_group_id`),
  ADD KEY `idx_phone` (`phone`),
  ADD KEY `idx_business` (`business_id`),
  ADD KEY `idx_credit_score` (`credit_score`);

--
-- Indexes for table `customer_groups`
--
ALTER TABLE `customer_groups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `business_id` (`business_id`);

--
-- Indexes for table `customer_loyalty_points`
--
ALTER TABLE `customer_loyalty_points`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `loyalty_program_id` (`loyalty_program_id`);

--
-- Indexes for table `customer_statements`
--
ALTER TABLE `customer_statements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_customer_date` (`customer_id`,`transaction_date`);

--
-- Indexes for table `deliveries`
--
ALTER TABLE `deliveries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tracking_number` (`tracking_number`),
  ADD KEY `business_id` (`business_id`),
  ADD KEY `sale_id` (`sale_id`),
  ADD KEY `delivery_zone_id` (`delivery_zone_id`),
  ADD KEY `driver_id` (`driver_id`),
  ADD KEY `idx_tracking` (`tracking_number`);

--
-- Indexes for table `delivery_zones`
--
ALTER TABLE `delivery_zones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `business_id` (`business_id`);

--
-- Indexes for table `depreciation_entries`
--
ALTER TABLE `depreciation_entries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `asset_id` (`asset_id`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `employee_number` (`employee_number`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `business_id` (`business_id`),
  ADD KEY `branch_id` (`branch_id`);

--
-- Indexes for table `exchange_rate_history`
--
ALTER TABLE `exchange_rate_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_currency_date` (`currency_code`,`effective_date`);

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `business_id` (`business_id`),
  ADD KEY `branch_id` (`branch_id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `idx_expense_date` (`expense_date`);

--
-- Indexes for table `expense_categories`
--
ALTER TABLE `expense_categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `business_id` (`business_id`);

--
-- Indexes for table `income_tax_entries`
--
ALTER TABLE `income_tax_entries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `business_id` (`business_id`);

--
-- Indexes for table `inventory_forecast`
--
ALTER TABLE `inventory_forecast`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `variant_id` (`variant_id`),
  ADD KEY `warehouse_id` (`warehouse_id`),
  ADD KEY `idx_alert_flag` (`alert_flag`),
  ADD KEY `idx_period` (`forecast_period`);

--
-- Indexes for table `inventory_movements`
--
ALTER TABLE `inventory_movements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `variant_id` (`variant_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_product_id` (`product_id`),
  ADD KEY `idx_warehouse_id` (`warehouse_id`),
  ADD KEY `idx_type` (`movement_type`),
  ADD KEY `idx_reference` (`reference_type`,`reference_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `inventory_stock`
--
ALTER TABLE `inventory_stock`
  ADD PRIMARY KEY (`id`),
  ADD KEY `variant_id` (`variant_id`),
  ADD KEY `idx_product_id` (`product_id`),
  ADD KEY `idx_warehouse_id` (`warehouse_id`);

--
-- Indexes for table `loans`
--
ALTER TABLE `loans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `business_id` (`business_id`);

--
-- Indexes for table `loan_payments`
--
ALTER TABLE `loan_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `loan_id` (`loan_id`);

--
-- Indexes for table `loyalty_programs`
--
ALTER TABLE `loyalty_programs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `business_id` (`business_id`);

--
-- Indexes for table `loyalty_transactions`
--
ALTER TABLE `loyalty_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `business_id` (`business_id`),
  ADD KEY `idx_user_unread` (`user_id`,`read_status`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `business_id` (`business_id`),
  ADD KEY `received_by` (`received_by`),
  ADD KEY `idx_sale_id` (`sale_id`),
  ADD KEY `idx_method` (`method`);

--
-- Indexes for table `payroll`
--
ALTER TABLE `payroll`
  ADD PRIMARY KEY (`id`),
  ADD KEY `business_id` (`business_id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `idx_period` (`period`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_business` (`business_id`),
  ADD KEY `idx_sku` (`sku`),
  ADD KEY `idx_barcode` (`barcode`),
  ADD KEY `idx_category` (`category`);

--
-- Indexes for table `product_attributes`
--
ALTER TABLE `product_attributes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `business_id` (`business_id`);

--
-- Indexes for table `product_batches`
--
ALTER TABLE `product_batches`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `variant_id` (`variant_id`),
  ADD KEY `warehouse_id` (`warehouse_id`),
  ADD KEY `idx_expiry` (`expiry_date`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `product_exchanges`
--
ALTER TABLE `product_exchanges`
  ADD PRIMARY KEY (`id`),
  ADD KEY `refund_id` (`refund_id`),
  ADD KEY `original_sale_id` (`original_sale_id`),
  ADD KEY `returned_product_id` (`returned_product_id`),
  ADD KEY `exchanged_product_id` (`exchanged_product_id`);

--
-- Indexes for table `product_pricing_tiers`
--
ALTER TABLE `product_pricing_tiers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `variant_id` (`variant_id`),
  ADD KEY `customer_group_id` (`customer_group_id`),
  ADD KEY `idx_product_group` (`product_id`,`customer_group_id`);

--
-- Indexes for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku` (`sku`),
  ADD UNIQUE KEY `barcode` (`barcode`),
  ADD KEY `idx_product` (`product_id`),
  ADD KEY `idx_sku` (`sku`);

--
-- Indexes for table `promotions`
--
ALTER TABLE `promotions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `business_id` (`business_id`),
  ADD KEY `idx_dates` (`start_date`,`end_date`);

--
-- Indexes for table `promotion_usage`
--
ALTER TABLE `promotion_usage`
  ADD PRIMARY KEY (`id`),
  ADD KEY `promotion_id` (`promotion_id`),
  ADD KEY `sale_id` (`sale_id`);

--
-- Indexes for table `purchase_invoices`
--
ALTER TABLE `purchase_invoices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `business_id` (`business_id`),
  ADD KEY `purchase_order_id` (`purchase_order_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_supplier_id` (`supplier_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `purchase_invoice_items`
--
ALTER TABLE `purchase_invoice_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `variant_id` (`variant_id`),
  ADD KEY `idx_purchase_invoice_id` (`purchase_invoice_id`);

--
-- Indexes for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD KEY `business_id` (`business_id`),
  ADD KEY `warehouse_id` (`warehouse_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `idx_supplier_id` (`supplier_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `variant_id` (`variant_id`),
  ADD KEY `idx_purchase_order` (`purchase_order_id`);

--
-- Indexes for table `quotations`
--
ALTER TABLE `quotations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `quotation_number` (`quotation_number`),
  ADD KEY `business_id` (`business_id`),
  ADD KEY `branch_id` (`branch_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_customer` (`customer_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `quotation_items`
--
ALTER TABLE `quotation_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `variant_id` (`variant_id`),
  ADD KEY `idx_quotation` (`quotation_id`);

--
-- Indexes for table `receivables`
--
ALTER TABLE `receivables`
  ADD PRIMARY KEY (`id`),
  ADD KEY `business_id` (`business_id`),
  ADD KEY `sale_id` (`sale_id`),
  ADD KEY `idx_customer_id` (`customer_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `refunds`
--
ALTER TABLE `refunds`
  ADD PRIMARY KEY (`id`),
  ADD KEY `business_id` (`business_id`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `idx_original_sale_id` (`original_sale_id`);

--
-- Indexes for table `regulatory_payments`
--
ALTER TABLE `regulatory_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `business_id` (`business_id`);

--
-- Indexes for table `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sale_number` (`sale_number`),
  ADD KEY `business_id` (`business_id`),
  ADD KEY `warehouse_id` (`warehouse_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `business_day_id` (`business_day_id`),
  ADD KEY `served_by` (`served_by`),
  ADD KEY `idx_branch_id` (`branch_id`),
  ADD KEY `idx_payment_status` (`payment_status`),
  ADD KEY `idx_sale_date` (`sale_date`);

--
-- Indexes for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `variant_id` (`variant_id`),
  ADD KEY `idx_sale_id` (`sale_id`);

--
-- Indexes for table `serial_numbers`
--
ALTER TABLE `serial_numbers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `serial_number` (`serial_number`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `variant_id` (`variant_id`),
  ADD KEY `warehouse_id` (`warehouse_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_serial` (`serial_number`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`),
  ADD KEY `business_id` (`business_id`);

--
-- Indexes for table `service_bookings`
--
ALTER TABLE `service_bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `business_id` (`business_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `service_id` (`service_id`),
  ADD KEY `branch_id` (`branch_id`);

--
-- Indexes for table `social_security_contributions`
--
ALTER TABLE `social_security_contributions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payroll_id` (`payroll_id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Indexes for table `staff_cash_sessions`
--
ALTER TABLE `staff_cash_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `branch_id` (`branch_id`),
  ADD KEY `business_day_id` (`business_day_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `stock_transfers`
--
ALTER TABLE `stock_transfers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `requested_by` (`requested_by`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_from_warehouse` (`from_warehouse_id`),
  ADD KEY `idx_to_warehouse` (`to_warehouse_id`);

--
-- Indexes for table `stock_transfer_items`
--
ALTER TABLE `stock_transfer_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `variant_id` (`variant_id`),
  ADD KEY `idx_transfer` (`transfer_id`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_business` (`business_id`);

--
-- Indexes for table `supplier_payments`
--
ALTER TABLE `supplier_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `business_id` (`business_id`),
  ADD KEY `purchase_invoice_id` (`purchase_invoice_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_supplier` (`supplier_id`);

--
-- Indexes for table `tax_configurations`
--
ALTER TABLE `tax_configurations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `business_id` (`business_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_email` (`email`);

--
-- Indexes for table `user_branches`
--
ALTER TABLE `user_branches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_branch` (`user_id`,`branch_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_branch_id` (`branch_id`);

--
-- Indexes for table `vat_entries`
--
ALTER TABLE `vat_entries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `business_id` (`business_id`),
  ADD KEY `idx_type` (`entry_type`),
  ADD KEY `idx_period` (`period`);

--
-- Indexes for table `warehouses`
--
ALTER TABLE `warehouses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `business_id` (`business_id`),
  ADD KEY `idx_branch_id` (`branch_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bank_accounts`
--
ALTER TABLE `bank_accounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `branches`
--
ALTER TABLE `branches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `business`
--
ALTER TABLE `business`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `commission_rules`
--
ALTER TABLE `commission_rules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `currencies`
--
ALTER TABLE `currencies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `customer_groups`
--
ALTER TABLE `customer_groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `customer_loyalty_points`
--
ALTER TABLE `customer_loyalty_points`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `delivery_zones`
--
ALTER TABLE `delivery_zones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `exchange_rate_history`
--
ALTER TABLE `exchange_rate_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `expense_categories`
--
ALTER TABLE `expense_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `inventory_forecast`
--
ALTER TABLE `inventory_forecast`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `inventory_stock`
--
ALTER TABLE `inventory_stock`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `loyalty_programs`
--
ALTER TABLE `loyalty_programs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `product_attributes`
--
ALTER TABLE `product_attributes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_pricing_tiers`
--
ALTER TABLE `product_pricing_tiers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_variants`
--
ALTER TABLE `product_variants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `promotion_usage`
--
ALTER TABLE `promotion_usage`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `purchase_invoice_items`
--
ALTER TABLE `purchase_invoice_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `quotation_items`
--
ALTER TABLE `quotation_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sale_items`
--
ALTER TABLE `sale_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `serial_numbers`
--
ALTER TABLE `serial_numbers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `stock_transfer_items`
--
ALTER TABLE `stock_transfer_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `tax_configurations`
--
ALTER TABLE `tax_configurations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `user_branches`
--
ALTER TABLE `user_branches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `warehouses`
--
ALTER TABLE `warehouses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `assets`
--
ALTER TABLE `assets`
  ADD CONSTRAINT `assets_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `assets_ibfk_2` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `audit_logs_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `bank_accounts`
--
ALTER TABLE `bank_accounts`
  ADD CONSTRAINT `bank_accounts_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bank_accounts_ibfk_2` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `bank_reconciliations`
--
ALTER TABLE `bank_reconciliations`
  ADD CONSTRAINT `bank_reconciliations_ibfk_1` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bank_reconciliations_ibfk_2` FOREIGN KEY (`reconciled_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `bank_transactions`
--
ALTER TABLE `bank_transactions`
  ADD CONSTRAINT `bank_transactions_ibfk_1` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `branches`
--
ALTER TABLE `branches`
  ADD CONSTRAINT `branches_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `business`
--
ALTER TABLE `business`
  ADD CONSTRAINT `business_ibfk_1` FOREIGN KEY (`base_currency`) REFERENCES `currencies` (`code`);

--
-- Constraints for table `business_days`
--
ALTER TABLE `business_days`
  ADD CONSTRAINT `business_days_ibfk_1` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `business_days_ibfk_2` FOREIGN KEY (`closed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `cashbook_entries`
--
ALTER TABLE `cashbook_entries`
  ADD CONSTRAINT `cashbook_entries_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cashbook_entries_ibfk_2` FOREIGN KEY (`business_day_id`) REFERENCES `business_days` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `cashbook_entries_ibfk_3` FOREIGN KEY (`staff_cash_session_id`) REFERENCES `staff_cash_sessions` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `cashbook_entries_ibfk_4` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `commission_earned`
--
ALTER TABLE `commission_earned`
  ADD CONSTRAINT `commission_earned_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `commission_earned_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `commission_earned_ibfk_3` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `commission_rules`
--
ALTER TABLE `commission_rules`
  ADD CONSTRAINT `commission_rules_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `customers`
--
ALTER TABLE `customers`
  ADD CONSTRAINT `customers_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `customers_ibfk_2` FOREIGN KEY (`customer_group_id`) REFERENCES `customer_groups` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `customer_groups`
--
ALTER TABLE `customer_groups`
  ADD CONSTRAINT `customer_groups_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `customer_loyalty_points`
--
ALTER TABLE `customer_loyalty_points`
  ADD CONSTRAINT `customer_loyalty_points_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `customer_loyalty_points_ibfk_2` FOREIGN KEY (`loyalty_program_id`) REFERENCES `loyalty_programs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `customer_statements`
--
ALTER TABLE `customer_statements`
  ADD CONSTRAINT `customer_statements_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `deliveries`
--
ALTER TABLE `deliveries`
  ADD CONSTRAINT `deliveries_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `deliveries_ibfk_2` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `deliveries_ibfk_3` FOREIGN KEY (`delivery_zone_id`) REFERENCES `delivery_zones` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `deliveries_ibfk_4` FOREIGN KEY (`driver_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `delivery_zones`
--
ALTER TABLE `delivery_zones`
  ADD CONSTRAINT `delivery_zones_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `depreciation_entries`
--
ALTER TABLE `depreciation_entries`
  ADD CONSTRAINT `depreciation_entries_ibfk_1` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `employees_ibfk_2` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `employees_ibfk_3` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `exchange_rate_history`
--
ALTER TABLE `exchange_rate_history`
  ADD CONSTRAINT `exchange_rate_history_ibfk_1` FOREIGN KEY (`currency_code`) REFERENCES `currencies` (`code`) ON DELETE CASCADE;

--
-- Constraints for table `expenses`
--
ALTER TABLE `expenses`
  ADD CONSTRAINT `expenses_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `expenses_ibfk_2` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `expenses_ibfk_3` FOREIGN KEY (`category_id`) REFERENCES `expense_categories` (`id`),
  ADD CONSTRAINT `expenses_ibfk_4` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `expense_categories`
--
ALTER TABLE `expense_categories`
  ADD CONSTRAINT `expense_categories_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `income_tax_entries`
--
ALTER TABLE `income_tax_entries`
  ADD CONSTRAINT `income_tax_entries_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `inventory_forecast`
--
ALTER TABLE `inventory_forecast`
  ADD CONSTRAINT `inventory_forecast_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `inventory_forecast_ibfk_2` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `inventory_forecast_ibfk_3` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `inventory_movements`
--
ALTER TABLE `inventory_movements`
  ADD CONSTRAINT `inventory_movements_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `inventory_movements_ibfk_2` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `inventory_movements_ibfk_3` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `inventory_movements_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `inventory_stock`
--
ALTER TABLE `inventory_stock`
  ADD CONSTRAINT `inventory_stock_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `inventory_stock_ibfk_2` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `inventory_stock_ibfk_3` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `loans`
--
ALTER TABLE `loans`
  ADD CONSTRAINT `loans_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `loan_payments`
--
ALTER TABLE `loan_payments`
  ADD CONSTRAINT `loan_payments_ibfk_1` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `loyalty_programs`
--
ALTER TABLE `loyalty_programs`
  ADD CONSTRAINT `loyalty_programs_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `loyalty_transactions`
--
ALTER TABLE `loyalty_transactions`
  ADD CONSTRAINT `loyalty_transactions_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payments_ibfk_3` FOREIGN KEY (`received_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `payroll`
--
ALTER TABLE `payroll`
  ADD CONSTRAINT `payroll_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payroll_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_attributes`
--
ALTER TABLE `product_attributes`
  ADD CONSTRAINT `product_attributes_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_batches`
--
ALTER TABLE `product_batches`
  ADD CONSTRAINT `product_batches_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_batches_ibfk_2` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_batches_ibfk_3` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_exchanges`
--
ALTER TABLE `product_exchanges`
  ADD CONSTRAINT `product_exchanges_ibfk_1` FOREIGN KEY (`refund_id`) REFERENCES `refunds` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_exchanges_ibfk_2` FOREIGN KEY (`original_sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_exchanges_ibfk_3` FOREIGN KEY (`returned_product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_exchanges_ibfk_4` FOREIGN KEY (`exchanged_product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_pricing_tiers`
--
ALTER TABLE `product_pricing_tiers`
  ADD CONSTRAINT `product_pricing_tiers_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_pricing_tiers_ibfk_2` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_pricing_tiers_ibfk_3` FOREIGN KEY (`customer_group_id`) REFERENCES `customer_groups` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD CONSTRAINT `product_variants_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `promotions`
--
ALTER TABLE `promotions`
  ADD CONSTRAINT `promotions_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `promotion_usage`
--
ALTER TABLE `promotion_usage`
  ADD CONSTRAINT `promotion_usage_ibfk_1` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `promotion_usage_ibfk_2` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `purchase_invoices`
--
ALTER TABLE `purchase_invoices`
  ADD CONSTRAINT `purchase_invoices_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `purchase_invoices_ibfk_2` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `purchase_invoices_ibfk_3` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `purchase_invoices_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `purchase_invoice_items`
--
ALTER TABLE `purchase_invoice_items`
  ADD CONSTRAINT `purchase_invoice_items_ibfk_1` FOREIGN KEY (`purchase_invoice_id`) REFERENCES `purchase_invoices` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `purchase_invoice_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `purchase_invoice_items_ibfk_3` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  ADD CONSTRAINT `purchase_orders_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `purchase_orders_ibfk_2` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `purchase_orders_ibfk_3` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `purchase_orders_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `purchase_orders_ibfk_5` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `purchase_order_items`
--
ALTER TABLE `purchase_order_items`
  ADD CONSTRAINT `purchase_order_items_ibfk_1` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `purchase_order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `purchase_order_items_ibfk_3` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `quotations`
--
ALTER TABLE `quotations`
  ADD CONSTRAINT `quotations_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quotations_ibfk_2` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quotations_ibfk_3` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quotations_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `quotation_items`
--
ALTER TABLE `quotation_items`
  ADD CONSTRAINT `quotation_items_ibfk_1` FOREIGN KEY (`quotation_id`) REFERENCES `quotations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quotation_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quotation_items_ibfk_3` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `receivables`
--
ALTER TABLE `receivables`
  ADD CONSTRAINT `receivables_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `receivables_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `receivables_ibfk_3` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `refunds`
--
ALTER TABLE `refunds`
  ADD CONSTRAINT `refunds_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `refunds_ibfk_2` FOREIGN KEY (`original_sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `refunds_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `regulatory_payments`
--
ALTER TABLE `regulatory_payments`
  ADD CONSTRAINT `regulatory_payments_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sales`
--
ALTER TABLE `sales`
  ADD CONSTRAINT `sales_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sales_ibfk_2` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sales_ibfk_3` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sales_ibfk_4` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `sales_ibfk_5` FOREIGN KEY (`business_day_id`) REFERENCES `business_days` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `sales_ibfk_6` FOREIGN KEY (`served_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD CONSTRAINT `sale_items_ibfk_1` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sale_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sale_items_ibfk_3` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `serial_numbers`
--
ALTER TABLE `serial_numbers`
  ADD CONSTRAINT `serial_numbers_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `serial_numbers_ibfk_2` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `serial_numbers_ibfk_3` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `services`
--
ALTER TABLE `services`
  ADD CONSTRAINT `services_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `service_bookings`
--
ALTER TABLE `service_bookings`
  ADD CONSTRAINT `service_bookings_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `service_bookings_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `service_bookings_ibfk_3` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `service_bookings_ibfk_4` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `social_security_contributions`
--
ALTER TABLE `social_security_contributions`
  ADD CONSTRAINT `social_security_contributions_ibfk_1` FOREIGN KEY (`payroll_id`) REFERENCES `payroll` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `social_security_contributions_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `staff_cash_sessions`
--
ALTER TABLE `staff_cash_sessions`
  ADD CONSTRAINT `staff_cash_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `staff_cash_sessions_ibfk_2` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `staff_cash_sessions_ibfk_3` FOREIGN KEY (`business_day_id`) REFERENCES `business_days` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `stock_transfers`
--
ALTER TABLE `stock_transfers`
  ADD CONSTRAINT `stock_transfers_ibfk_1` FOREIGN KEY (`from_warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stock_transfers_ibfk_2` FOREIGN KEY (`to_warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stock_transfers_ibfk_3` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `stock_transfers_ibfk_4` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `stock_transfer_items`
--
ALTER TABLE `stock_transfer_items`
  ADD CONSTRAINT `stock_transfer_items_ibfk_1` FOREIGN KEY (`transfer_id`) REFERENCES `stock_transfers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stock_transfer_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stock_transfer_items_ibfk_3` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD CONSTRAINT `suppliers_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `supplier_payments`
--
ALTER TABLE `supplier_payments`
  ADD CONSTRAINT `supplier_payments_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `supplier_payments_ibfk_2` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `supplier_payments_ibfk_3` FOREIGN KEY (`purchase_invoice_id`) REFERENCES `purchase_invoices` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `supplier_payments_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `tax_configurations`
--
ALTER TABLE `tax_configurations`
  ADD CONSTRAINT `tax_configurations_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_branches`
--
ALTER TABLE `user_branches`
  ADD CONSTRAINT `user_branches_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_branches_ibfk_2` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `vat_entries`
--
ALTER TABLE `vat_entries`
  ADD CONSTRAINT `vat_entries_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `warehouses`
--
ALTER TABLE `warehouses`
  ADD CONSTRAINT `warehouses_ibfk_1` FOREIGN KEY (`business_id`) REFERENCES `business` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `warehouses_ibfk_2` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
