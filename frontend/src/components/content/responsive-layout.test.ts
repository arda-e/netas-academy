import test from "node:test";
import assert from "node:assert/strict";

import { responsiveLayoutClasses } from "./responsive-layout";

test("listing grids keep denser mobile gaps and add tablet columns", () => {
  assert.equal(
    responsiveLayoutClasses.courseListGrid,
    "grid gap-3 sm:gap-4 md:grid-cols-2 lg:gap-5 xl:grid-cols-3"
  );
  assert.equal(
    responsiveLayoutClasses.eventListGrid,
    "grid gap-3 sm:gap-4 md:grid-cols-2 lg:gap-5"
  );
  assert.equal(
    responsiveLayoutClasses.blogListGrid,
    "grid gap-3 sm:gap-4 md:grid-cols-2 lg:gap-5"
  );
  assert.equal(
    responsiveLayoutClasses.newsListGrid,
    "grid gap-3 sm:gap-4 md:grid-cols-2 lg:gap-5"
  );
});

test("event detail meta and cta stay stacked on narrow screens", () => {
  assert.equal(
    responsiveLayoutClasses.eventMeta,
    "flex flex-col gap-1.5 break-words text-sm leading-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-2 sm:text-base"
  );
  assert.equal(
    responsiveLayoutClasses.eventCta,
    "w-full rounded-sm sm:w-auto sm:self-start"
  );
});
