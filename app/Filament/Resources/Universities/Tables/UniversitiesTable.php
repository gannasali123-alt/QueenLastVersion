<?php

namespace App\Filament\Resources\Universities\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Filament\Support\Enums\Alignment;

class UniversitiesTable
{
    public static function configure(Table $table): Table
    {
        return $table

            ->columns([
                TextColumn::make('name')
                    ->searchable(),
                TextColumn::make('email')
                    ->label('Email address')
                    ->searchable(),
                TextColumn::make('email_verified_at')
                    ->toggleable(isToggledHiddenByDefault: true)
                    ->dateTime()
                    ->sortable(),
                TextColumn::make('street.name')
                    ->searchable()
                                        ->label('الشارع'),

                TextColumn::make('phone')
                    ->searchable(),

            ToggleColumn::make('status')
                ->label('موافقة؟')
                ->getStateUsing(fn ($record) => $record->status === 'approved')
                ->updateStateUsing(fn ($state, $record) => $record->update([
                    'status' => $state ? 'approved' : 'pending',
                ]))
                ->disabled(fn ($record) => $record->status === 'rejected'),

                  TextColumn::make('status_badge')
                ->label('الحالة')
                ->getStateUsing(fn ($record) => $record->status)
                ->badge()
                ->colors([
                    'warning' => 'pending',
                    'success' => 'approved',
                    'danger'  => 'rejected',
                ]),
                TextColumn::make('type')
                    ->badge()
                    ->colors([
                        'danger' => 'public',
                        'non' => 'private',
                    ]),
                TextColumn::make('avg_star')
                    ->label('التقييم')
                    ->getStateUsing(fn ($record) => round((float) $record->starAvg(), 1))
                    ->formatStateUsing(function ($state) {
                        $avg = (float) $state;
                        $rounded = (int) round($avg);
                        $stars = str_repeat('★', $rounded) . str_repeat('☆', max(0, 5 - $rounded));
                        return "<span style=\"color:#f59e0b;font-size:22px;line-height:1\">{$stars}</span> <span style=\"color:#6b7280;font-size:19px\">({$avg})</span>";
                    })
                    ->html()
                    ->sortable(),
                TextColumn::make('star_count')
                    ->label('عدد التقييمات')
                    ->getStateUsing(fn ($record) => (int) $record->starCount())
                    ->alignment(Alignment::Center)
                    ->sortable(),
                ImageColumn::make('image_path')
                    ->disk('public')
                    ->imageHeight(40)
                    ->imageWidth(40)
                    ->circular(),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

            ])
              ->striped()
            ->filters([
                SelectFilter::make('status')
                    ->options([
                        'pending' => 'pending',
                        'approved' => 'approved',
                        'rejected' => 'rejected',
                    ]),
              SelectFilter::make('type')
                    ->options([
                        'private' => 'private',
                        'public' => 'public',
                    ]),
            ])
            ->recordActions([
              ViewAction::make(),
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}


