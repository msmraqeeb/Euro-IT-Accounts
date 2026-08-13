<?php
/**
 * Euro IT Accounts - cPanel MySQL REST API Endpoint
 * Upload this file to your cPanel hosting (e.g. inside public_html/api.php or subfolder)
 */

// Allow Cross-Origin Requests (CORS)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ----------------------------------------------------
// DATABASE CONFIGURATION (Update with your cPanel details)
// ----------------------------------------------------
$db_host = "localhost"; // Usually 'localhost' when api.php is inside cPanel
$db_name = "YOUR_CPANEL_DB_NAME";    // e.g. cpanelusername_euroitaccounts
$db_user = "YOUR_CPANEL_DB_USER";    // e.g. cpanelusername_dbuser
$db_pass = "YOUR_CPANEL_DB_PASSWORD"; // e.g. Your_DB_Password

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Database Connection Failed: " . $e->getMessage()]);
    exit();
}

$action = $_GET['action'] ?? '';
$input = json_decode(file_get_contents('php://input'), true);

switch ($action) {

    // 1. FETCH ALL DATA (Clients, Payments, Expenses)
    case 'fetchData':
        try {
            $clientsStmt = $pdo->query("SELECT * FROM clients");
            $clients = $clientsStmt->fetchAll();

            // Convert boolean/numeric types
            foreach ($clients as &$client) {
                $client['isActive'] = (bool)$client['isActive'];
                $client['createdAt'] = (int)$client['createdAt'];
                $client['totalBilled'] = (float)$client['totalBilled'];
            }

            $paymentsStmt = $pdo->query("SELECT * FROM payments");
            $payments = $paymentsStmt->fetchAll();
            foreach ($payments as &$payment) {
                $payment['amount'] = (float)$payment['amount'];
            }

            $expensesStmt = $pdo->query("SELECT * FROM expenses");
            $expenses = $expensesStmt->fetchAll();
            foreach ($expenses as &$expense) {
                $expense['amount'] = (float)$expense['amount'];
            }

            echo json_encode([
                "status" => "success",
                "data" => [
                    "clients" => $clients,
                    "payments" => $payments,
                    "expenses" => $expenses
                ]
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;

    // 2. ADD / UPDATE CLIENT
    case 'saveClient':
        try {
            $sql = "INSERT INTO clients (id, name, email, phone, company, notes, createdAt, isActive, totalBilled)
                    VALUES (:id, :name, :email, :phone, :company, :notes, :createdAt, :isActive, :totalBilled)
                    ON DUPLICATE KEY UPDATE 
                    name=:name, email=:email, phone=:phone, company=:company, notes=:notes, 
                    isActive=:isActive, totalBilled=:totalBilled";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':id' => $input['id'],
                ':name' => $input['name'],
                ':email' => $input['email'] ?? null,
                ':phone' => $input['phone'] ?? null,
                ':company' => $input['company'] ?? null,
                ':notes' => $input['notes'] ?? null,
                ':createdAt' => $input['createdAt'] ?? round(microtime(true) * 1000),
                ':isActive' => isset($input['isActive']) ? ($input['isActive'] ? 1 : 0) : 1,
                ':totalBilled' => $input['totalBilled'] ?? 0
            ]);

            echo json_encode(["status" => "success", "message" => "Client saved successfully"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;

    // 3. ADD / UPDATE PAYMENT
    case 'savePayment':
        try {
            $sql = "INSERT INTO payments (id, clientId, amount, date, description, method, details, type)
                    VALUES (:id, :clientId, :amount, :date, :description, :method, :details, :type)
                    ON DUPLICATE KEY UPDATE 
                    clientId=:clientId, amount=:amount, date=:date, description=:description, 
                    method=:method, details=:details, type=:type";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':id' => $input['id'],
                ':clientId' => $input['clientId'],
                ':amount' => $input['amount'],
                ':date' => $input['date'],
                ':description' => $input['description'] ?? null,
                ':method' => $input['method'] ?? 'Bank Transfer',
                ':details' => $input['details'] ?? null,
                ':type' => $input['type'] ?? 'RECEIVED'
            ]);

            echo json_encode(["status" => "success", "message" => "Payment saved successfully"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;

    // 4. DELETE PAYMENT
    case 'deletePayment':
        try {
            $stmt = $pdo->prepare("DELETE FROM payments WHERE id = :id");
            $stmt->execute([':id' => $input['id'] ?? $_GET['id'] ?? '']);
            echo json_encode(["status" => "success", "message" => "Payment deleted"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;

    // 5. ADD EXPENSE
    case 'saveExpense':
        try {
            $sql = "INSERT INTO expenses (id, category, amount, date, description)
                    VALUES (:id, :category, :amount, :date, :description)
                    ON DUPLICATE KEY UPDATE 
                    category=:category, amount=:amount, date=:date, description=:description";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':id' => $input['id'],
                ':category' => $input['category'],
                ':amount' => $input['amount'],
                ':date' => $input['date'],
                ':description' => $input['description'] ?? null
            ]);

            echo json_encode(["status" => "success", "message" => "Expense saved successfully"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;

    // 6. DELETE EXPENSE
    case 'deleteExpense':
        try {
            $stmt = $pdo->prepare("DELETE FROM expenses WHERE id = :id");
            $stmt->execute([':id' => $input['id'] ?? $_GET['id'] ?? '']);
            echo json_encode(["status" => "success", "message" => "Expense deleted"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;

    default:
        echo json_encode(["status" => "online", "message" => "Euro IT Accounts API is running"]);
        break;
}
