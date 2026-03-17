"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconSearch, IconX } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

const categories = [
  "Development",
  "Business",
  "Finance",
  "It & Software",
  "Office Productivity",
  "Design",
  "Health & Fitness",
  "Marketing",
  "Music",
  "Personal Development",
];

const levels = ["Beginner", "Intermediate", "Advanced"];

interface CourseFiltersProps {
  search?: string;
  category?: string;
  level?: string;
}

export function CourseFilters({ search, category, level }: CourseFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(search ?? "");

  const updateParams = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/courses?${params.toString()}`);
    },
    [router, searchParams]
  );

  function handleSearch() {
    updateParams("search", searchValue || null);
  }

  function handleClear() {
    setSearchValue("");
    router.push("/courses");
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-8">
      <div className="flex-1 flex gap-2">
        <Input
          placeholder="Search courses..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="max-w-sm"
        />
        <Button variant="outline" size="icon" onClick={handleSearch}>
          <IconSearch className="size-4" />
        </Button>
      </div>
      <Select
        value={category ?? "all"}
        onValueChange={(v) => updateParams("category", v)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={level ?? "all"}
        onValueChange={(v) => updateParams("level", v)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Levels</SelectItem>
          {levels.map((lvl) => (
            <SelectItem key={lvl} value={lvl}>
              {lvl}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {(search || category || level) && (
        <Button variant="ghost" size="icon" onClick={handleClear}>
          <IconX className="size-4" />
        </Button>
      )}
    </div>
  );
}
