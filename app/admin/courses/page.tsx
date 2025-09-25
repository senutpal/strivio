import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default function CoursesPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold ">Your Courses</h1>
        <Link className={buttonVariants({})} href="/admin/courses/create">
          Create Courses
        </Link>
          </div>
          <div>
              <h1>
                  Here You aill see all fo the courses 
              </h1>
          </div>
          
    </>
  );
}
