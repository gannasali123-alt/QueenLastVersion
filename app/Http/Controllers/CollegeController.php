<?php

namespace App\Http\Controllers;

use App\Models\College;
use App\Models\University;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CollegeController extends Controller
{
  /**
   * عرض قائمة الكليات - يرجع بيانات متوافقة مع واجهة `Colleges` (Inertia props)

   */
  public function index(Request $request): Response
  {
    $query = College::with('majors');

    // collect majors that actually have published offerings in any university
    $publishedMajorIds = \App\Models\UniversityMajor::where('published', true)->pluck('major_id')->toArray();

    if ($request->has('search')) {
      $query->where('name', 'like', '%' . $request->search . '%');
    }

    $colleges = $query->get()->map(function ($college) use ($publishedMajorIds) {
      return [
        'id' => $college->id,
        'name' => $college->name,
        'nameAr' => $college->name_ar ?? $college->name,
        'image' => $this->fileUrl($college->image_path),
        'description' => $college->description ?? null,
        'descriptionAr' => $college->description_ar ?? $college->description ?? null,
        // only include majors that have published university offerings
        'majors' => $college->majors->filter(function ($major) use ($publishedMajorIds) {
          return in_array($major->id, $publishedMajorIds, true);
        })->map(function ($major) use ($college) {
          // map major fields expected by the frontend
          $jobs = $major->designation_jobs;
          $career = [];
          if (is_string($jobs)) {
            // try json then comma separated
            $decoded = json_decode($jobs, true);
            if (is_array($decoded)) {
              $career = $decoded;
            } else {
              $career = array_filter(array_map('trim', explode(',', $jobs)));
            }
          } elseif (is_array($jobs)) {
            $career = $jobs;
          }

          return [
            'id' => $major->id,
            'name' => $major->name,
            'nameAr' => $major->name_ar ?? $major->name,
            'collegeId' => $college->id,
            'description' => $major->description,
            'descriptionAr' => $major->description_ar ?? $major->description,
            'years' => (int) ($major->study_years ?? 0),
            'fees' => 0,
            'gpa' => $major->gpa ?? null,
            'careerOpportunities' => $career,
          ];
        })->values(),
      ];
    })->values();

    // Universities with their offered majors and per-major offerings
    // only load published university majors
    $universities = University::with(['universityMajors' => function ($q) {
      $q->where('published', true)->with('major');
    }])->where('status', 'approved')->get()->map(function ($u) {
      return [
        'id' => $u->id,
        'name' => $u->name,
        'nameAr' => $u->name_ar ?? $u->name,
        'location' => $u->location ?? $u->address,
        'locationAr' => $u->location_ar ?? $u->address,
        'rating' => method_exists($u, 'starAvg') ? $u->starAvg() : 0,
        'fees' => null,
        'image' => $this->fileUrl($u->image_path),
        'logo' => $this->fileUrl($u->image_path),
        'description' => $u->description,
        // array of major ids offered by this university
        'majors' => $u->universityMajors->map(function ($um) {
          return $um->major->id;
        })->values(),
        // detailed offerings per major (only published ones loaded)
        'major_offerings' => $u->universityMajors->map(function ($um) {
          return [
            'major_id' => $um->major->id,
            'tuition_fee' => $um->tuition_fee,
            'study_years' => $um->study_years,
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

  /**
   * Show a specific college (optional: used if page uses show)
   */
  public function show(College $college): Response
  {
    $college->load('majors');

    $collegeData = [
      'id' => $college->id,
      'name' => $college->name,
      'nameAr' => $college->name_ar ?? $college->name,
      'description' => $college->description,
      'image' => $this->fileUrl($college->image_path),
      'majors' => $college->majors->map(function ($major) use ($college) {
        return [
          'id' => $major->id,
          'name' => $major->name,
          'description' => $major->description,
          'years' => (int) ($major->study_years ?? 0),
        ];
      })->values(),
    ];

    return Inertia::render('Colleges', [
      'collegeData' => $collegeData,
    ]);
  }

  /**
   * Resolve storage or absolute URLs for media fields.
   */
  protected function fileUrl(?string $path): ?string
  {
    if (!$path) {
      return null;
    }

    if (Str::startsWith($path, ['http://', 'https://'])) {
      return $path;
    }

    return Storage::url($path);
  }
}


