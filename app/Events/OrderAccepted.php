<?php

namespace App\Events;

// app/Events/OrderAccepted.php
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\InteractsWithSockets;

class OrderAccepted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $orderId;
    public string $table;

    public function __construct(string $orderId, string $table)
    {
        $this->orderId = $orderId;
        $this->table   = $table;
    }

    public function broadcastOn(): Channel
    {
        return new Channel('shop');
    }

    public function broadcastAs(): string
    {
        return 'OrderAccepted';
    }

    public function broadcastWith(): array
    {
        return [
            'order_id' => $this->orderId,
            'table'    => $this->table,
        ];
    }
}
