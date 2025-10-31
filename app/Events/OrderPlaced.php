<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\InteractsWithSockets;

class OrderPlaced implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $order_id;  // ✅ NEW
    public string $name;
    public string $order;
    public string $count;
    public string $table;

    public function __construct(string $order_id, string $name, string $order, string $count, string $table)
    {
        $this->order_id = $order_id;
        $this->name     = $name;
        $this->order    = $order;
        $this->count    = $count;
        $this->table    = $table;
    }

    public function broadcastOn(): Channel { return new Channel('shop'); }
    public function broadcastAs(): string { return 'OrderPlaced'; }

    public function broadcastWith(): array
    {
        return [
            'order_id' => $this->order_id,   // ✅ ส่ง id มาด้วย
            'name'     => $this->name,
            'order'    => $this->order,
            'count'    => $this->count,
            'table'    => $this->table,
        ];
    }
}