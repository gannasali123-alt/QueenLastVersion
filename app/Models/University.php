<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use App\Models\Traits\HasPublicId;
use App\Models\UniversityMajor;
use App\Models\UniversityImage;
use Filament\Auth\MultiFactor\App\Contracts\HasAppAuthentication;
use Filament\Auth\MultiFactor\Email\Contracts\HasEmailAuthentication;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Filament\Forms\Concerns\InteractsWithForms;
use JobMetric\Star\HasStar;
use Illuminate\Support\Facades\Storage;

class University extends Authenticatable implements HasEmailAuthentication, HasAppAuthentication
{
    /** @use HasFactory<\Database\Factories\UniversityFactory> */
    use HasFactory,HasPublicId,InteractsWithForms,HasStar,Notifiable;


        protected $fillable = [
        'public_id',
        'name',
        'password',
        'email',
        'address',
        'phone',
        'description',
        'status',
        'type',
        'location',
        'image_path',
        'has_email_authentication',
        'image_background',
        'password'

    ];

     protected $hidden = [
        'id',
        'password',
        'remember_token',
        'app_authentication_secret'
      ];

    protected $attributes = [
      'has_email_authentication' => false,
    ];
          protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'has_email_authentication' =>'boolean',
        'app_authentication_secret' =>'encrypted'
    ];

    public function getRouteKeyName(): string
    {
        return 'public_id';
    }

public function street()
{
    return $this->belongsTo(Street::class, 'address'); 
}

    /**
     * Append alias attributes for convenience.
     * `avatar` is an alias to `image_path` and `avatar_url` returns the public URL.
     */
    protected $appends = [
      'avatar',
      'avatar_url',
    ];

    public function getAvatarAttribute(): ?string
    {
      return $this->image_path;
    }

    public function setAvatarAttribute(?string $value): void
    {
      $this->attributes['image_path'] = $value;
    }

    public function getAvatarUrlAttribute(): ?string
    {
      if (empty($this->image_path)) {
        return null;
      }

      try {
        // Prefer the unlocked route so responses include CORS headers when needed
        if (\Illuminate\Support\Facades\Route::has('storage.unlocked')) {
          return url('/storage-unlocked/' . ltrim($this->image_path, '/'));
        }

        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk('public');
        return $disk->url($this->image_path);
      } catch (\Throwable $e) {
        return $this->image_path;
      }
    }



public function universityMajors()
{
  return $this->hasMany(UniversityMajor::class);
}

public function universityPosts()
{
  return $this->hasMany(UniversityPost::class);
}

    public function images()
    {
      return $this->hasMany(UniversityImage::class);
    }

    public function HasEmailAuthentication():bool
    {
      return (bool) $this->has_email_authentication;
    }

    public function toggleEmailAuthentication(bool $condetion):void
    {
      $this->has_email_authentication=$condetion;
      $this->save();
    }

    // public function canAccessPanel(Panel $panel): bool
    // {
    //   return $this->email=='Jihad@gmail.com';
    // }


    public function getAppAuthenticationSecret(): ?string
    {
          return $this->app_authentication_secret;
    }

    public function saveAppAuthenticationSecret(?string $secret): void
    {
        $this->app_authentication_secret=$secret;
        $this->save();
    }

    public function getAppAuthenticationHolderName(): string
    {
                return $this->email;
    }


}
