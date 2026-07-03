<?php

namespace App\Exceptions;

use InvalidArgumentException;

class UnsupportedAgeException extends InvalidArgumentException
{
    public function __construct(public readonly int $age)
    {
        parent::__construct("Unsupported age: {$age}.");
    }
}
