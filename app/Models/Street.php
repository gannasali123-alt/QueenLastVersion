<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\HasPublicId;

class Street extends Model
{
    /** @use HasFactory<\Database\Factories\StreetFactory> */
    use HasFactory,HasPublicId;


        protected $fillable = [
        'public_id',
        'name',
    ];

    protected $hidden = ['id'];

    public function getRouteKeyName(): string
    {
        return 'public_id';
    }

    public function universities()
{
    return $this->hasMany(University::class);
}

}
