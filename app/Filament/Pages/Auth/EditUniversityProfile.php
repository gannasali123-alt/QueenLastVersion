<?php

namespace App\Filament\Pages\Auth;

use App\Models\Street;
use App\Services\Image\ImageProcessor;
use Filament\Auth\Pages\EditProfile as BaseEditProfile;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Schemas\Schema;
use Illuminate\Http\UploadedFile;

class EditUniversityProfile extends BaseEditProfile
{
    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                $this->getNameFormComponent(),
                $this->getEmailFormComponent(),

                TextInput::make('phone')
                    ->label('رقم الهاتف')
                    ->tel()
                    ->nullable(),

                // TextInput::make('address')
                //     ->label('العنوان')
                //     ->nullable(),

                Select::make('address')
                    ->label('الشارع')
                    ->options(fn () => Street::query()->pluck('name', 'id')->all())
                    ->searchable()
                    ->preload()
                    ->required(),

                Select::make('type')
                    ->label('نوع الجامعة')
                    ->options([
                        'private' => 'أهلي',
                        'public' => 'حكومي',
                    ])
                    ->nullable(),

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
                    ->label('شعار الجامعة')
                    ->directory('universities')
                    ->image()
                    ->maxSize(6144)
                    ->storeFiles(false)
                    ->preserveFilenames(),


                $this->getPasswordFormComponent(),
                $this->getPasswordConfirmationFormComponent(),
                $this->getCurrentPasswordFormComponent(),
            ]);
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        $processor = app(ImageProcessor::class);

        // process uploaded logo
        if (! empty($data['image_path']) && $data['image_path'] instanceof UploadedFile) {
            // delete old stored file if exists
            if ($this->getUser()->image_path) {
                $processor->deleteStored($this->getUser()->image_path);
            }

            $paths = $processor->processAndStore($data['image_path'], 'universities');
            $data['image_path'] = $paths['path_main'] ?? null;
        } else {
            // keep existing logo if no new upload was provided
            $data['image_path'] = $this->getUser()->image_path;
        }

        // process uploaded background
        if (! empty($data['image_background']) && $data['image_background'] instanceof UploadedFile) {
            if ($this->getUser()->image_background) {
                $processor->deleteStored($this->getUser()->image_background);
            }

            $paths = $processor->processAndStore($data['image_background'], 'universities');
            $data['image_background'] = $paths['path_main'] ?? null;
        } else {
            // keep existing background if unchanged
            $data['image_background'] = $this->getUser()->image_background;
        }

        return $data;
    }
}

