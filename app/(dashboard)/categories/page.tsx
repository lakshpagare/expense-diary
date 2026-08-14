"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CategoryIcon } from "@/components/ui/category-icon";
import type { CategoryDTO } from "@/types";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("tag");
  const [color, setColor] = useState("#64748b");

  const ICON_OPTIONS = [
    "utensils",
    "car",
    "shopping-bag",
    "receipt",
    "home",
    "clapperboard",
    "heart-pulse",
    "graduation-cap",
    "shopping-cart",
    "fuel",
    "smartphone",
    "repeat",
    "user",
    "more-horizontal",
  ];

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories ?? []);
    } catch (err) {
      console.error("Error loading categories:", err);
      toast.error("Unable to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadCategories();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadCategories]);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error("Please enter a category name");
      return;
    }

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, icon, color }),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error ?? "Failed to create category");
        return;
      }

      toast.success("Category created successfully");
      setName("");
      setIcon("tag");
      setColor("#64748b");
      loadCategories();
    } catch (err) {
      console.error("Error creating category:", err);
      toast.error("Unable to create category");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Categories</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create and manage your expense categories
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Category</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div>
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                placeholder="e.g., Coffee"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="icon">Icon</Label>
              <select
                id="icon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2"
              >
                {ICON_OPTIONS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="color">Color</Label>
              <input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-full rounded-lg border border-border"
              />
            </div>

            <Button type="submit" className="w-full">
              Create Category
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : categories.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No custom categories yet. Create one above.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <div
                  key={category._id}
                  className="flex items-center gap-3 rounded-lg border border-border p-3"
                >
                  <CategoryIcon
                    icon={category.icon}
                    color={category.color}
                    className="h-6 w-6"
                  />
                  <div>
                    <p className="font-medium text-foreground">
                      {category.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {category.icon}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
