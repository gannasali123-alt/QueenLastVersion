<?php

namespace App\Http\Controllers;

use App\Models\College;
use App\Models\University;
use App\Models\UniversityMajor;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CollegeController extends Controller
{
    public function index(Request $request): Response
    {
        // 1. جلب IDs التخصصات التي لها عروض منشورة في جامعات معتمدة
        // نستخدم الموديل مباشرة هنا لضمان الحصول على المعرفات الربط
        $publishedMajorIds = UniversityMajor::where('published', true)
            ->whereHas('university', function ($q) {
                $q->where('status', 'approved');
            })
            ->pluck('major_id')
            ->unique()
            ->toArray();

        // 2. جلب الكليات وتخصصاتها (الفلترة البرمجية تغني عن عمود active)
        $colleges = College::with(['majors' => function ($q) use ($publishedMajorIds) {
                $q->whereIn('id', $publishedMajorIds);
            }])
            ->get()
            ->filter(fn($college) => $college->majors->count() > 0)
            ->map(function ($college) {
                return [
                    'id' => (string) $college->id,
                    'name' => $college->name,
                    'nameAr' => $college->name_ar ?? $college->name,
                    'image' => $this->fileUrl($college->image_path),
                    'description' => $college->description,
                    'descriptionAr' => $college->description_ar ?? $college->description,
                    'majors' => $college->majors->map(function ($major) {
                        $jobs = $major->designation_jobs;
                        $career = is_string($jobs) ? json_decode($jobs, true) : $jobs;
                        if (!is_array($career)) {
                            $career = array_filter(array_map('trim', explode(',', (string)$jobs)));
                        }

                        return [
                            'id' => (string) $major->id,
                            'name' => $major->name,
                            'nameAr' => $major->name_ar ?? $major->name,
                            'description' => $major->description,
                            'descriptionAr' => $major->description_ar ?? $major->description,
                            'years' => (int) ($major->study_years ?? 0),
                            'gpa' => $major->gpa,
                            'careerOpportunities' => array_values($career),
                            'careerOpportunitiesAr' => array_values($career),
                        ];
                    })->values(),
                ];
            })->values();

        // 3. جلب الجامعات المعتمدة مع عروضها
        $universities = University::where('status', 'approved')
            ->with(['universityMajors' => function ($q) {
                $q->where('published', true);
            }])
            ->get()
            ->map(function ($u) {
                return [
                    'id' => (string) $u->id,
                    'name' => $u->name,
                    'nameAr' => $u->name_ar ?? $u->name,
                    'location' => $u->location ?? $u->address,
                    'locationAr' => $u->location_ar ?? $u->address,
                    'rating' => method_exists($u, 'starAvg') ? (float)$u->starAvg() : 0,
                    'image' => $this->fileUrl($u->image_path),
                    // نستخدم major_id من جدول الربط مباشرة للفلترة في React
                    'majors' => $u->universityMajors->pluck('major_id')->map(fn($id) => (string)$id)->values(),
                    'major_offerings' => $u->universityMajors->map(function ($um) {
                        return [
                            'major_id' => (string) $um->major_id,
                            'fees' => (float) $um->tuition_fee,
                            'study_years' => (int) $um->study_years,
                            'admission_rate' => $um->admission_rate,
                        ];
                    })->values(),
                ];
            })->values();

        return Inertia::render('Colleges', [
            'colleges' => $colleges,
            'universities' => $universities,
        ]);
    }

    protected function fileUrl(?string $path): ?string
    {
        if (!$path) return null;
        if (Str::startsWith($path, ['http://', 'https://'])) return $path;
        return Storage::url($path);
    }
}
