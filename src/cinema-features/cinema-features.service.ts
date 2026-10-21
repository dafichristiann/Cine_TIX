import { Injectable, BadRequestException } from '@nestjs/common';

export interface ConcessionItem {
  id: string;
  name: string;
  category: 'Popcorn' | 'Beverage' | 'Snack' | 'Combo';
  price: number;
  description: string;
  imageUrl: string;
}

export interface PromoResult {
  valid: boolean;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscount?: number;
  minSpend: number;
  message: string;
}

@Injectable()
export class CinemaFeaturesService {
  private readonly concessions: ConcessionItem[] = [
    {
      id: 'combo-premiere',
      name: 'Combo Premiere Cinema',
      category: 'Combo',
      price: 65000,
      description: '1 Popcorn Jumbo Caramel + 2 Minuman Dingin Segar',
      imageUrl: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'popcorn-caramel',
      name: 'Signature Caramel Popcorn',
      category: 'Popcorn',
      price: 38000,
      description: 'Jagung meletup renyah dibalut karamel manis gurih khas bioskop',
      imageUrl: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'popcorn-salted',
      name: 'Classic Salted Popcorn',
      category: 'Popcorn',
      price: 35000,
      description: 'Popcorn hangat dengan taburan sea salt dan mentega lezat',
      imageUrl: 'https://images.unsplash.com/photo-1512149177596-f817c7ef5d4c?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'iced-cola',
      name: 'Iced Cinema Cola (Large)',
      category: 'Beverage',
      price: 22000,
      description: 'Kesegaran soda dingin berkarbonasi tinggi pendamping nonton',
      imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'nachos-cheese',
      name: 'Crispy Nachos & Cheese Dip',
      category: 'Snack',
      price: 42000,
      description: 'Tortilla chips renyah disajikan dengan saus keju cheddar hangat',
      imageUrl: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'tea-lemon',
      name: 'Iced Lemon Sparkle Tea',
      category: 'Beverage',
      price: 24000,
      description: 'Teh beraroma lemon segar dengan es batu melimpah',
      imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
    },
  ];

  private readonly promos: Record<string, Omit<PromoResult, 'valid' | 'message'>> = {
    CINETIX10: {
      code: 'CINETIX10',
      discountType: 'percentage',
      discountValue: 10,
      maxDiscount: 25000,
      minSpend: 40000,
    },
    HEMAT15: {
      code: 'HEMAT15',
      discountType: 'fixed',
      discountValue: 15000,
      minSpend: 50000,
    },
    VIPEXPERIENCE: {
      code: 'VIPEXPERIENCE',
      discountType: 'fixed',
      discountValue: 30000,
      minSpend: 100000,
    },
  };

  getConcessions(): ConcessionItem[] {
    return this.concessions;
  }

  validatePromo(code: string, subtotal: number): { valid: boolean; discount: number; finalTotal: number; message: string; promo?: any } {
    if (!code) {
      throw new BadRequestException('Kode promo tidak boleh kosong');
    }

    const cleanCode = code.trim().toUpperCase();
    const promo = this.promos[cleanCode];

    if (!promo) {
      return {
        valid: false,
        discount: 0,
        finalTotal: subtotal,
        message: 'Kode voucher atau promo tidak valid',
      };
    }

    if (subtotal < promo.minSpend) {
      return {
        valid: false,
        discount: 0,
        finalTotal: subtotal,
        message: `Minimal transaksi untuk promo ini adalah Rp ${promo.minSpend.toLocaleString('id-ID')}`,
      };
    }

    let discount = 0;
    if (promo.discountType === 'percentage') {
      discount = Math.round((subtotal * promo.discountValue) / 100);
      if (promo.maxDiscount && discount > promo.maxDiscount) {
        discount = promo.maxDiscount;
      }
    } else {
      discount = promo.discountValue;
    }

    if (discount > subtotal) {
      discount = subtotal;
    }

    return {
      valid: true,
      discount,
      finalTotal: subtotal - discount,
      message: `Kode promo ${cleanCode} berhasil digunakan!`,
      promo: {
        code: cleanCode,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
      },
    };
  }
}
