'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Link as LinkIcon, Search, X, Loader2, Globe, Smile } from 'lucide-react';

// ── Microsoft Animated Fluent Emoji catalogue ──────────────────────────────────
const BASE = 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis';
const EMOJI_CATALOGUE = [
  // Medical / Pharmacy
  { name: 'Pill',            url: `${BASE}/Objects/Pill.png` },
  { name: 'Syringe',         url: `${BASE}/Medical/Syringe.png` },
  { name: 'Stethoscope',     url: `${BASE}/Medical/Stethoscope.png` },
  { name: 'Test Tube',       url: `${BASE}/Objects/Test%20Tube.png` },
  { name: 'Microscope',      url: `${BASE}/Objects/Microscope.png` },
  { name: 'Adhesive',        url: `${BASE}/Objects/Adhesive%20Bandage.png` },
  { name: 'Droplet',         url: `${BASE}/Travel%20and%20places/Droplet.png` },
  { name: 'Lotion Bottle',   url: `${BASE}/Objects/Lotion%20Bottle.png` },
  { name: 'Jar',             url: `${BASE}/Food/Jar.png` },
  { name: 'Thermometer',     url: `${BASE}/Medical/Thermometer.png` },
  // Packaging / Logistics
  { name: 'Package',         url: `${BASE}/Objects/Package.png` },
  { name: 'Shopping Bags',   url: `${BASE}/Objects/Shopping%20Bags.png` },
  { name: 'Label',           url: `${BASE}/Objects/Label.png` },
  { name: 'Scroll',          url: `${BASE}/Objects/Scroll.png` },
  { name: 'Inbox Tray',      url: `${BASE}/Objects/Inbox%20Tray.png` },
  { name: 'Outbox Tray',     url: `${BASE}/Objects/Outbox%20Tray.png` },
  { name: 'Briefcase',       url: `${BASE}/Objects/Briefcase.png` },
  { name: 'Shopping Cart',   url: `${BASE}/Objects/Shopping%20Cart.png` },
  { name: 'Toolbox',         url: `${BASE}/Objects/Toolbox.png` },
  // Nature / Wellness
  { name: 'Herb',            url: `${BASE}/Animals%20and%20Nature/Herb.png` },
  { name: 'Leaf',            url: `${BASE}/Animals%20and%20Nature/Fallen%20Leaf.png` },
  { name: 'Green Heart',     url: `${BASE}/Smileys/Green%20Heart.png` },
  { name: 'Blue Heart',      url: `${BASE}/Smileys/Blue%20Heart.png` },
  { name: 'Sparkles',        url: `${BASE}/Travel%20and%20places/Sparkles.png` },
  { name: 'Star',            url: `${BASE}/Travel%20and%20places/Star.png` },
  { name: 'Glowing Star',    url: `${BASE}/Travel%20and%20places/Glowing%20Star.png` },
  { name: 'Rainbow',         url: `${BASE}/Travel%20and%20places/Rainbow.png` },
  { name: 'Water Wave',      url: `${BASE}/Travel%20and%20places/Water%20Wave.png` },
  { name: 'Sunflower',       url: `${BASE}/Animals%20and%20Nature/Sunflower.png` },
  { name: 'Cherry Blossom',  url: `${BASE}/Animals%20and%20Nature/Cherry%20Blossom.png` },
  // Food / Vitamins
  { name: 'Apple',           url: `${BASE}/Food/Red%20Apple.png` },
  { name: 'Lemon',           url: `${BASE}/Food/Lemon.png` },
  { name: 'Grapes',          url: `${BASE}/Food/Grapes.png` },
  { name: 'Blueberries',     url: `${BASE}/Food/Blueberries.png` },
  { name: 'Avocado',         url: `${BASE}/Food/Avocado.png` },
  { name: 'Honey Pot',       url: `${BASE}/Food/Honey%20Pot.png` },
  { name: 'Cup of Tea',      url: `${BASE}/Food/Teacup%20Without%20Handle.png` },
  // Objects / Office
  { name: 'Clipboard',       url: `${BASE}/Objects/Clipboard.png` },
  { name: 'Memo',            url: `${BASE}/Objects/Memo.png` },
  { name: 'Chart Up',        url: `${BASE}/Objects/Chart%20Increasing.png` },
  { name: 'Calendar',        url: `${BASE}/Objects/Calendar.png` },
  { name: 'Clock',           url: `${BASE}/Travel%20and%20places/Clock%20Face%20Eleven%20Oclock.png` },
  { name: 'Phone',           url: `${BASE}/Objects/Mobile%20Phone.png` },
  { name: 'Laptop',          url: `${BASE}/Objects/Laptop.png` },
  { name: 'Lock',            url: `${BASE}/Objects/Locked.png` },
  { name: 'Key',             url: `${BASE}/Objects/Key.png` },
  { name: 'Light Bulb',      url: `${BASE}/Objects/Light%20Bulb.png` },
  { name: 'Shield',          url: `${BASE}/Objects/Shield.png` },
  { name: 'Trophy',          url: `${BASE}/Activities/Trophy.png` },
  { name: 'Gem',             url: `${BASE}/Activities/Gem%20Stone.png` },
  { name: 'Money Bag',       url: `${BASE}/Objects/Money%20Bag.png` },
  { name: 'Handshake',       url: `${BASE}/People/Handshake.png` },
  { name: 'Rocket',          url: `${BASE}/Travel%20and%20places/Rocket.png` },
  { name: 'Fire',            url: `${BASE}/Travel%20and%20places/Fire.png` },
  { name: 'Crystal Ball',    url: `${BASE}/Activities/Crystal%20Ball.png` },
  { name: 'Magnifier',       url: `${BASE}/Objects/Magnifying%20Glass%20Tilted%20Left.png` },
  { name: 'Truck',           url: `${BASE}/Travel%20and%20places/Delivery%20Truck.png` },
  { name: 'Hospital',        url: `${BASE}/Travel%20and%20places/Hospital.png` },
  { name: 'House',           url: `${BASE}/Travel%20and%20places/House.png` },
  { name: 'Globe',           url: `${BASE}/Travel%20and%20places/Globe%20Showing%20Americas.png` },
];

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  bucket?: 'product-images' | 'category-images' | 'avatars';
  helperText?: string;
}

export default function ImageUploader({ 
  value, 
  onChange, 
  label = 'Image', 
  bucket = 'product-images',
  helperText 
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'emoji' | 'url' | 'upload'>('emoji');
  const [emojiSearch, setEmojiSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const filteredEmojis = emojiSearch.trim()
    ? EMOJI_CATALOGUE.filter(e => e.name.toLowerCase().includes(emojiSearch.toLowerCase()))
    : EMOJI_CATALOGUE;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
      onChange(publicUrl);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGoogleSearch = () => {
    const q = encodeURIComponent(label === 'Image' ? 'pharmacy supply product icon' : label + ' icon transparent');
    window.open(`https://www.google.com/search?q=${q}&tbm=isch`, '_blank');
  };

  if (value) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">{label}</Label>
          <Button variant="ghost" size="sm" onClick={() => onChange('')} className="h-7 text-xs text-red-500 hover:text-red-700 hover:bg-red-50">
            <X className="w-3 h-3 mr-1" /> Remove
          </Button>
        </div>
        <div className="relative group rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div className="flex items-center justify-center p-4 bg-gray-50 min-h-[120px]">
            <img
              src={value}
              alt="Preview"
              className="max-h-32 max-w-full object-contain drop-shadow-md transition-transform group-hover:scale-110 duration-300"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x150?text=Preview+Error'; }}
            />
          </div>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button variant="secondary" size="sm" onClick={() => onChange('')} className="h-8 shadow-lg">
              ✕ Replace
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold">{label}</Label>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3 h-9">
          <TabsTrigger value="emoji" className="text-xs gap-1.5">
            <Smile className="w-3 h-3" /> MS Emoji
          </TabsTrigger>
          <TabsTrigger value="url" className="text-xs gap-1.5">
            <LinkIcon className="w-3 h-3" /> URL
          </TabsTrigger>
          <TabsTrigger value="upload" className="text-xs gap-1.5">
            <Upload className="w-3 h-3" /> Upload
          </TabsTrigger>
        </TabsList>

        {/* ── Microsoft Fluent Emoji Picker ── */}
        <TabsContent value="emoji" className="mt-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input
              value={emojiSearch}
              onChange={(e) => setEmojiSearch(e.target.value)}
              placeholder="Search emojis... (pill, bag, jar…)"
              className="pl-9 h-9 text-sm"
            />
          </div>
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-52 overflow-y-auto pr-1 rounded-lg">
            {filteredEmojis.map((emoji) => (
              <button
                key={emoji.url}
                type="button"
                title={emoji.name}
                onClick={() => onChange(emoji.url)}
                className="group flex flex-col items-center justify-center p-1.5 rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all duration-150 aspect-square"
              >
                <img
                  src={emoji.url}
                  alt={emoji.name}
                  className="w-8 h-8 object-contain drop-shadow-sm group-hover:scale-125 transition-transform duration-200"
                  loading="lazy"
                />
              </button>
            ))}
            {filteredEmojis.length === 0 && (
              <div className="col-span-full text-center text-xs text-gray-400 py-6">
                No emojis matching &ldquo;{emojiSearch}&rdquo;
              </div>
            )}
          </div>
          <p className="text-[10px] text-gray-400">Microsoft Fluent 3D Animated Emojis • Click to select</p>
        </TabsContent>

        {/* ── URL / Paste ── */}
        <TabsContent value="url" className="mt-3 space-y-3">
          <div className="flex gap-2">
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://example.com/image.png"
              className="flex-1 text-sm h-10"
            />
            <Button type="button" variant="outline" onClick={handleGoogleSearch} title="Search Google Images" className="h-10 px-3 bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100">
              <Search className="w-4 h-4 mr-1" />
              <Globe className="w-3 h-3" />
            </Button>
          </div>
          {helperText && <p className="text-[10px] text-gray-500">{helperText}</p>}
        </TabsContent>

        {/* ── File Upload ── */}
        <TabsContent value="upload" className="mt-3">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
          >
            {isUploading
              ? <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              : <Upload className="w-8 h-8 text-gray-400" />
            }
            <span className="text-sm font-medium text-gray-600">
              {isUploading ? 'Uploading…' : 'Click to upload or drag & drop'}
            </span>
            <span className="text-[10px] text-gray-400">PNG, JPG, WebP or GIF (max 2 MB)</span>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
