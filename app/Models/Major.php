<?php

namespace App\Models;

use App\Models\College;
use App\Models\Traits\HasPublicId;
use App\Models\UniversityMajor;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Major extends Model
{
    /** @use HasFactory<\Database\Factories\MajorFactory> */
    use HasFactory,HasPublicId;


      protected $fillable = [
          'public_id',
          'name',
          'description',
          'designation_jobs',
          'study_years',
          'college_id',
    ];

         protected $hidden = ['id'];

    public function getRouteKeyName(): string
    {
        return 'public_id';
    }

        public function college(): BelongsTo
    {
        return $this->belongsTo(College::class);
    }

        public function universityMajors()
{
  return $this->hasMany(UniversityMajor::class);
}
  public function universities()
{
    return $this->belongsToMany(
        University::class,
        'university_majors'
    );
}
}
