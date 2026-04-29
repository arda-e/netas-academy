"use client";

import { useState } from "react";
import { BlogList } from "@/components/content";
import type { BlogListItem } from "@/components/content/blog";

type BlogSearchProps = {
  posts: BlogListItem[];
};

export function BlogSearch({ posts }: BlogSearchProps) {
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLocaleLowerCase("tr-TR");

  const filtered = normalizedQuery
    ? posts.filter((post) =>
        post.title.toLocaleLowerCase("tr-TR").includes(normalizedQuery)
      )
    : posts;

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <input
          type="text"
          placeholder="Blog yazılarında ara..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-md rounded-sm border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 outline-none transition-colors focus:border-[#009ca6] focus:bg-white/10"
        />
      </div>
      <BlogList
        items={filtered}
        emptyMessage="Aramanızla eşleşen blog yazısı bulunamadı."
      />
    </div>
  );
}
