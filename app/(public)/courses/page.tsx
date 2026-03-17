import { getAllCourses } from "@/app/data/course/get-all-courses";
import {
  PublicCourseCard,
  PublicCourseCardSkeleton,
} from "../_components/PublicCourseCard";
import { Suspense } from "react";
import { CourseFilters } from "./_components/CourseFilters";

type SearchParams = Promise<{
  search?: string;
  category?: string;
  level?: string;
  minPrice?: string;
  maxPrice?: string;
}>;

export default async function PublicCourseRoute({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  return (
    <div className="mt-5">
      <div className="flex flex-col space-y-2 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Explore Courses
        </h1>
        <p className="text-muted-foreground">
          Discover our wide range of courses designed to help you achieve your
          learning goals
        </p>
      </div>
      <CourseFilters
        search={params.search}
        category={params.category}
        level={params.level}
      />
      <Suspense fallback={<LoadingSkeletonLayout />}>
        <RenderCourses
          search={params.search}
          category={params.category}
          level={params.level}
          minPrice={params.minPrice ? parseInt(params.minPrice) : undefined}
          maxPrice={params.maxPrice ? parseInt(params.maxPrice) : undefined}
        />
      </Suspense>
    </div>
  );
}

async function RenderCourses({
  search,
  category,
  level,
  minPrice,
  maxPrice,
}: {
  search?: string;
  category?: string;
  level?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  const courses = await getAllCourses({
    search,
    category,
    level,
    minPrice,
    maxPrice,
  });

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-xl font-medium mb-2">No courses found</p>
        <p className="text-muted-foreground">
          Try adjusting your filters or search terms
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <PublicCourseCard key={course.id} data={course} />
      ))}
    </div>
  );
}

function LoadingSkeletonLayout() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 9 }).map((_, index) => (
        <PublicCourseCardSkeleton key={index} />
      ))}
    </div>
  );
}
