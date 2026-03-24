<?php

namespace App\Filament\Pages\Auth;

use App\Models\Street;
use App\Models\University;
use Filament\Auth\Pages\Register as BaseRegister;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Schemas\Components\Wizard;
use Filament\Schemas\Components\Wizard\Step;
use Filament\Schemas\Schema;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
class RegisterUniversity extends BaseRegister
{
    /**
     *
     */
    public function form(Schema $schema): Schema
    {
        $schema = parent::form($schema);

        return $schema->components([
            Wizard::make([
                Step::make('بيانات الحساب')
                    ->schema([
                        TextInput::make('phone')
                            ->label('رقم الهاتف')
                            ->tel()
                            ->required()
                            ->unique(University::class, 'phone'),
                        TextInput::make('email')
                            ->label('البريد الإلكتروني')
                            ->email()
                            ->required()
                            ->unique(University::class, 'email'),
                        TextInput::make('password')
                            ->label('كلمة المرور')
                            ->password()
                            ->required()
                            ->confirmed(),


                        TextInput::make('password_confirmation')
                            ->label('تأكيد كلمة المرور')
                            ->password()
                            ->required()

                    ]),

                Step::make('بيانات الجامعة')
                    ->schema([
                        TextInput::make('name')
                            ->label('اسم الجامعة')
                            ->required()
                            ->unique(University::class, 'name'),

              
                    Select::make('address')
                            ->label('الشارع')
                            ->options(fn () => Street::query()->pluck('name', 'id')->all())
                            ->searchable()
                            ->preload()
                            ->required(),






                        Select::make('type')
                            ->label('نوع الجامعة')
                            ->default('private')
                            ->options([
                                'private' => 'أهلي',
                                'public' => 'حكومي',
                            ])
                            ->required(),

                        Textarea::make('description')
                            ->label('الوصف')
                            ->rows(4)
                            ->nullable(),

                        TextInput::make('location')
                            ->label('الموقع')
                            ->nullable(),

                        FileUpload::make('image_path')
                            ->label('شعار الجامعة')
                            ->directory('universities')
                            ->image()
                            ->maxSize(6144)
                            ->storeFiles(false)
                            ->preserveFilenames()
                            ->nullable(),


                        FileUpload::make('image_background')
                            ->label('لوحةالجامعة')
                            ->directory('universities')
                            ->image()
                            ->maxSize(6144)
                            ->storeFiles(false)
                            ->preserveFilenames()
                            ->nullable(),

                    ]),
            ]),
        ]);
      }

    protected function handleRegistration(array $data): University
    {
        $processor = app(\App\Services\Image\ImageProcessor::class);

        // process uploaded files if present
        if (! empty($data['image_path']) && $data['image_path'] instanceof \Illuminate\Http\UploadedFile) {
            $paths = $processor->processAndStore($data['image_path'], 'universities');
            $data['image_path'] = $paths['path_main'] ?? null;
        }

        if (! empty($data['image_background']) && $data['image_background'] instanceof \Illuminate\Http\UploadedFile) {
            $paths = $processor->processAndStore($data['image_background'], 'universities');
            $data['image_background'] = $paths['path_main'] ?? null;
        }

        return University::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'address' => $data['address'] ?? null,
            'phone' => $data['phone'] ?? null,
            'description' => $data['description'] ?? null,
            'status' => 'pending',
            'type' => $data['type'] ?? 'private',
            'location' => $data['location'] ?? null,
            'image_path' => $data['image_path'] ?? null,
            'image_background' => $data['image_background'] ?? null,
        ]);
    }
}

