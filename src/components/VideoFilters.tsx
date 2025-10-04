/**
 * Video filters component for advanced filtering
 */

import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Filter, X } from 'lucide-react';
import { useState } from 'react';

export interface FilterValues {
  fromDate?: string;
  toDate?: string;
  resolution?: string;
  tags?: string;
}

interface VideoFiltersProps {
  filters: FilterValues;
  onChange: (filters: FilterValues) => void;
}

export function VideoFilters({ filters, onChange }: VideoFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters = Object.values(filters).some(value => value);

  const handleClear = () => {
    onChange({});
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="size-4" />
          Filters
          {hasActiveFilters && (
            <span className="bg-primary text-primary-foreground rounded-full size-5 flex items-center justify-center text-xs">
              {Object.values(filters).filter(v => v).length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4>Filter Videos</h4>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-auto p-1"
              >
                <X className="size-4" />
                Clear
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="fromDate">From Date</Label>
              <Input
                id="fromDate"
                type="date"
                value={filters.fromDate || ''}
                onChange={(e) => onChange({ ...filters, fromDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="toDate">To Date</Label>
              <Input
                id="toDate"
                type="date"
                value={filters.toDate || ''}
                onChange={(e) => onChange({ ...filters, toDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resolution">Resolution</Label>
              <Select
                value={filters.resolution || 'all'}
                onValueChange={(value) =>
                  onChange({ ...filters, resolution: value === 'all' ? undefined : value })
                }
              >
                <SelectTrigger id="resolution">
                  <SelectValue placeholder="All resolutions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All resolutions</SelectItem>
                  <SelectItem value="480p">480p</SelectItem>
                  <SelectItem value="720p">720p</SelectItem>
                  <SelectItem value="1080p">1080p</SelectItem>
                  <SelectItem value="1440p">1440p</SelectItem>
                  <SelectItem value="2160p">4K (2160p)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                type="text"
                placeholder="travel, vlog, music"
                value={filters.tags || ''}
                onChange={(e) => onChange({ ...filters, tags: e.target.value })}
              />
            </div>
          </div>

          <Button onClick={() => setIsOpen(false)} className="w-full">
            Apply Filters
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
