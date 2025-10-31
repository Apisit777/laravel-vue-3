<?php

// routes/api.php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Events\OrderPlaced;
use App\Events\OrderAccepted;

Route::post('/order', function (Request $request) {
    $data = $request->validate([
        'name'  => 'required|string',
        'order' => 'required|string',
        'count' => 'required|integer',
        'table' => 'required|string',
        'order_id' => 'sometimes|string', // ถ้าส่งมาจาก client
    ]);

    // ถ้าไม่มี id จาก client ก็สร้างเอง
    $orderId = $data['order_id'] ?? Str::uuid()->toString();

    // ยิง broadcast พร้อม order_id
    OrderPlaced::dispatch(
        $orderId, 
        $data['name'], 
        $data['order'], 
        (string)$data['count'], 
        $data['table']
    );

    return response()->json(['ok' => true, 'order_id' => $orderId]);
});

Route::post('/order/accept', function (Request $request) {
    $data = $request->validate([
        'order_id' => 'required|string',
        'table'    => 'required|string|in:A1,A2,B1,B2',
    ]);

    // broadcast ลด/ลบ
    OrderAccepted::dispatch($data['order_id'], $data['table']);

    return response()->json(['ok' => true]);
});