<?php

namespace App\Filament\Resources\Universities\Schemas;

// use App\Livewire\ViewProduct;
// use Filament\Actions\CreateAction;
// use Filament\Actions\RestoreAction;
use App\Models\Street;
use Filament\Forms\Components\DateTimePicker;
// use Filament\Forms\Components\Select;
// use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\ToggleButtons;
use Filament\Schemas\Schema;
// use Illuminate\Support\Facades\Route;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Facades\Hash;
use Mokhosh\FilamentRating\Components\Rating;
// use Mokhosh\FilamentRating\RatingTheme;
// use Illuminate\Database\Eloquent\Model;

class UniversityForm
{
  public static function configure(Schema $schema): Schema
  {
    return $schema
      ->components([
        TextInput::make('name')->required()->unique(),
        TextInput::make('email')
          ->label('Email address')
          ->email()
          ->required()
          ->unique(),
        DateTimePicker::make('email_verified_at'),
        TextInput::make('password')
          ->password()
          ->dehydrateStateUsing(fn(?string $state) => $state ? Hash::make($state) : null)
          ->dehydrated(fn(?string $state) => filled($state))
          ->required(fn(string $operation) => $operation === 'create')
          ->maxLength(255)
          ->confirmed()
          ->hidden(fn($record, string $operation) => $operation === 'edit')
          ->revealable(),

        TextInput::make('password_confirmation')
          ->password()
          ->required(fn(string $operation) => $operation === 'create')
          ->same('password')
          ->hidden(fn($record, string $operation) => $operation === 'edit')
          ->revealable(),

        Select::make('address')
          ->label('الشارع')
          ->options(fn () => Street::query()->pluck('name', 'id')->all())
          ->searchable()
          ->preload()
          ->required(),



        TextInput::make('phone')
          ->tel()
          ->default(null),
        Textarea::make('description')
          ->default(null)
          ->columnSpanFull(),

        ToggleButtons::make('status')
          ->options([
            'pending' => 'Pending',
            'approved' => 'Approved',
            'rejected' => 'Rejected',
          ])
          ->colors([
            'pending' => 'warning',
            'approved' => 'success',
            'rejected' => 'danger',
          ])
          ->grouped()
          ->default('pending')
          ->required(),
        ToggleButtons::make('type')
          ->options(['public' => 'Public', 'private' => 'Private'])
          ->default('medium')
          ->colors([
            'public' => 'warning',
            'private' => 'success',
          ])
          ->icons([
            'public' => Heroicon::OutlinedPencil,
            'private' => Heroicon::OutlinedClock,
          ])
          ->grouped()
          ->required(),

        Textarea::make('location')
          ->default(null)
          ->columnSpanFull(),
        FileUpload::make('image_path')
          ->image()
          ->disk('public')
          ->preserveFilenames()
          ->maxSize(6144)
          ->downloadable()
          ->openable()
          ->directory('universities')
          ->dehydrated(fn($state) => filled($state)),

        FileUpload::make('image_background')
          ->image()
          ->disk('public')
          ->preserveFilenames()
          ->maxSize(6144)
          ->downloadable()
          ->openable()
          ->directory('universities')
          ->dehydrated(fn($state) => filled($state)),
      ]);
  }
}
