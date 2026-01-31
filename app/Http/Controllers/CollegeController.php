<?php

namespace App\Http\Controllers;

use App\Models\College;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CollegeController extends Controller
{
  /**
   * عرض قائمة الكليات
   */
  public function index(Request $request): Response
  {
    $query = College::withCount('majors');

    // Filtering
    if ($request->has('search')) {
      $query->where('name', 'like', '%' . $request->search . '%');
    }

    $colleges = $query->get()->map(function ($college) {
      return [
        'public_id' => $college->public_id,
        'name' => $college->name,
        'description' => $college->description,
        'image_path' => $college->image_path,
        'majors_count' => $college->majors_count,
      ];
    });

    return Inertia::render('Colleges', [
      'collegesData' => $colleges,
    ]);
  }

  /**
   * عرض تفاصيل كلية معينة
   */
  public function show(College $college): Response
  {
    $college->load('majors');

    $collegeData = [
      'public_id' => $college->public_id,
      'name' => $college->name,
      'description' => $college->description,
      'image_path' => $college->image_path,
      'majors_count' => $college->majors()->count(),
      'majors' => $college->majors->map(function ($major) {
        return [
          'public_id' => $major->public_id,
          'name' => $major->name,
          'description' => $major->description,
          'designation_jobs' => $major->designation_jobs,
          'study_years' => $major->study_years,
        ];
      }),
    ];

    return Inertia::render('Colleges', [
      'public_id' => $college->public_id,
      'collegeData' => $collegeData,
    ]);
  }
}
