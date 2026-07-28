import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Heart } from 'lucide-react';
import { useToggleWishlist } from '../../hooks/useApi';

export const PropertyGridCard = ({ item }) => {
  const toggleWishlistMutation = useToggleWishlist();

  const handleWishlist = async (e) => {
    e.preventDefault();
    const targetId = item?.id || item?._id;
    if (!targetId) return;
    try {
      await toggleWishlistMutation.mutateAsync(targetId);
    } catch (err) {
      console.error(err);
    }
  };

  const imageUrl = item.images?.[0]?.url || item.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';

  return (
    <Card className="group overflow-hidden border-border hover:border-primary transition-all duration-200">
      <div className="h-48 overflow-hidden relative">
        <img
          src={imageUrl}
          alt={item.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
          {item.listingType || 'FOR SALE'}
        </Badge>
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-card/80 backdrop-blur-xs text-foreground hover:text-rose-500 transition-colors"
        >
          <Heart className="w-4 h-4" />
        </button>
      </div>

      <CardContent className="p-4 space-y-2">
        <div className="text-lg font-heading font-bold text-primary">
          ₹ {Number(item.price || 8500000).toLocaleString('en-IN')}
        </div>
        <h3 className="font-heading font-semibold text-sm line-clamp-1 text-foreground">{item.title}</h3>
        <p className="text-xs text-muted-foreground flex items-center">
          <MapPin className="w-3.5 h-3.5 mr-1 text-primary" />
          {item.city}, {item.address || item.locality || 'Sector 62'}
        </p>

        <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border">
          <span>{item.bedrooms || 3} BHK</span>
          <span>•</span>
          <span>{item.areaSqFt || 1200} sqft</span>
          <span>•</span>
          <span>{item.constructionStatus || 'Ready'}</span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 gap-2">
        <Link to={`/properties/${item.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full text-xs">View Details</Button>
        </Link>
        <Link to={`/compare?p1=${encodeURIComponent(item.id)}&t1=${encodeURIComponent(item.title)}`} className="flex-1">
          <Button variant="secondary" size="sm" className="w-full text-xs">Compare</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
