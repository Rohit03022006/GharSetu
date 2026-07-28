import React from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const PropertyCompareMatrixTable = ({ comparedData }) => {
  if (!comparedData || comparedData.length === 0) return null;

  return (
    <Card className="p-4 sm:p-6 overflow-hidden">
      <h3 className="text-base font-heading font-bold mb-4">Detailed Side-by-Side Comparison</h3>
      <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-36 sm:w-48 font-bold">Specification</TableHead>
              {comparedData.map((item, idx) => (
                <TableHead key={item.id || idx} className="min-w-[200px] sm:min-w-[240px] font-heading font-bold text-foreground">
                  {item.title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-semibold text-muted-foreground">Price</TableCell>
              {comparedData.map((item, idx) => (
                <TableCell key={item.id || idx} className="font-bold text-primary tabular-nums">
                  ₹ {Number(item.price).toLocaleString('en-IN')}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold text-muted-foreground">Location</TableCell>
              {comparedData.map((item, idx) => (
                <TableCell key={item.id || idx}>{item.city}</TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold text-muted-foreground">BHK & Area</TableCell>
              {comparedData.map((item, idx) => (
                <TableCell key={item.id || idx}>{item.bhk} BHK • {item.area || '1,200 sqft'}</TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
