<?php

namespace App\Filament\Resources\Universities\Schemas;

use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\ImageEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

class UniversityInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextEntry::make('public_id'),
                TextEntry::make('name'),
                TextEntry::make('email')
                    ->label('Email address'),
                TextEntry::make('email_verified_at')
                    ->dateTime(),
                TextEntry::make('street.name')
                    ->label('الشارع'),
                TextEntry::make('phone'),
                TextEntry::make('status'),
                TextEntry::make('type'),
                TextEntry::make('rating')
                    ->label('التقييم')
                    ->state(function ($record) {
                        $avg = round((float) $record->starAvg(), 1);
                        $rounded = (int) round($avg);
                        $stars = str_repeat('★', $rounded) . str_repeat('☆', max(0, 5 - $rounded));
                        $count = (int) $record->starCount();
                        return "<span style=\"color:#f59e0b;font-size:25px;line-height:1\">{$stars}</span> "
                             . "<span style=\"color:#6b7280;font-size:20px\">({$avg}) · {$count} تقييم</span>";
                    })
                    ->html(),
                ImageEntry::make('image_path')
                    ->disk('public'),
                IconEntry::make('has_email_authentication')
                    ->boolean(),
                ImageEntry::make('image_background')
                    ->disk('public'),
                TextEntry::make('created_at')
                    ->dateTime(),
                TextEntry::make('updated_at')
                    ->dateTime(),
            ]);
    }
}
