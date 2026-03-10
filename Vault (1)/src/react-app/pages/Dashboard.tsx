import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { 
  Shield, Plus, Search, Key, FileText, CreditCard, 
  MoreVertical, Copy, Eye, EyeOff, Trash2, Edit, 
  LogOut, ChevronDown, Loader2
} from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { Label } from "@/react-app/components/ui/label";
import { Textarea } from "@/react-app/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/react-app/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/react-app/components/ui/dialog";
import { useAuth } from "@getmocha/users-service/react";

interface VaultItem {
  id: number;
  type: string;
  name: string;
  username?: string;
  password?: string;
  website?: string;
  card_number?: string;
  card_expiry?: string;
  card_cvv?: string;
  note_content?: string;
  created_at: string;
}

const categories = [
  { id: "all", name: "All Items", icon: Shield },
  { id: "password", name: "Passwords", icon: Key },
  { id: "note", name: "Secure Notes", icon: FileText },
  { id: "card", name: "Payment Cards", icon: CreditCard },
];

export default function Dashboard() {
  const { user, isPending, logout } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPassword, setShowPassword] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VaultItem | null>(null);
  const [viewingItem, setViewingItem] = useState<VaultItem | null>(null);

  useEffect(() => {
    if (!isPending && !user) {
      navigate("/");
    }
  }, [user, isPending, navigate]);

  useEffect(() => {
    if (user) {
      fetchItems();
    }
  }, [user]);

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/vault-items");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error("Failed to fetch items:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/vault-items/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems(items.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || item.type === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryCounts = () => {
    return {
      all: items.length,
      password: items.filter(i => i.type === "password").length,
      note: items.filter(i => i.type === "note").length,
      card: items.filter(i => i.type === "card").length,
    };
  };

  const counts = getCategoryCounts();

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background dark flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/50 flex flex-col">
        <div className="p-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-lg">
              <Shield className="w-4 h-4 text-black" />
            </div>
            <span className="text-lg font-bold text-foreground">Vault</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === cat.id
                  ? "bg-white/10 text-white"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <cat.icon className="w-4 h-4" />
              <span className="flex-1 text-left">{cat.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeCategory === cat.id ? "bg-white/20" : "bg-muted"
              }`}>
                {counts[cat.id as keyof typeof counts]}
              </span>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black text-sm font-medium">
                  {user.google_user_data?.name?.[0] || user.email[0].toUpperCase()}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.google_user_data?.name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 border-b border-border flex items-center justify-between px-6">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search vault..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-transparent focus:border-border"
            />
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-white text-black hover:bg-white/90 shadow-lg">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </header>

        <div className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              {categories.find(c => c.id === activeCategory)?.name}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} in your vault
            </p>
          </div>

          <div className="grid gap-3">
            {filteredItems.map((item) => (
              <VaultItemCard
                key={item.id}
                item={item}
                showPassword={showPassword === item.id}
                onTogglePassword={() => setShowPassword(showPassword === item.id ? null : item.id)}
                onCopy={copyToClipboard}
                onClick={() => setViewingItem(item)}
                onEdit={() => setEditingItem(item)}
                onDelete={() => handleDelete(item.id)}
              />
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No items found</h3>
              <p className="text-muted-foreground text-sm">
                {searchQuery ? "Try a different search term" : "Add your first item to get started"}
              </p>
            </div>
          )}
        </div>
      </main>

      <AddItemDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={(item) => {
          setItems([item, ...items]);
          setIsAddDialogOpen(false);
        }}
      />

      <EditItemDialog
        item={editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        onSave={(updated) => {
          setItems(items.map(i => i.id === updated.id ? updated : i));
          setEditingItem(null);
        }}
      />

      <ViewItemDialog
        item={viewingItem}
        onOpenChange={(open) => !open && setViewingItem(null)}
        onCopy={copyToClipboard}
        onEdit={() => {
          setEditingItem(viewingItem);
          setViewingItem(null);
        }}
      />
    </div>
  );
}

function VaultItemCard({ 
  item, 
  showPassword, 
  onTogglePassword,
  onCopy,
  onClick,
  onEdit,
  onDelete,
}: { 
  item: VaultItem; 
  showPassword: boolean;
  onTogglePassword: () => void;
  onCopy: (text: string) => void;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const getIcon = () => {
    switch (item.type) {
      case "password": return <Key className="w-5 h-5" />;
      case "note": return <FileText className="w-5 h-5" />;
      case "card": return <CreditCard className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  return (
    <div className="group bg-card border border-border rounded-xl p-4 hover:border-white/30 transition-all hover:shadow-lg cursor-pointer" onClick={onClick}>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate">{item.name}</h3>
          {item.type === "password" && (
            <p className="text-sm text-muted-foreground truncate">{item.username}</p>
          )}
          {item.type === "note" && (
            <p className="text-sm text-muted-foreground truncate">{item.note_content}</p>
          )}
          {item.type === "card" && (
            <p className="text-sm text-muted-foreground">•••• {item.card_number?.slice(-4)}</p>
          )}
        </div>

        {item.type === "password" && item.password && (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <div className="px-3 py-1.5 bg-muted rounded-lg font-mono text-sm text-muted-foreground">
              {showPassword ? item.password : "••••••••••••"}
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onTogglePassword}>
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onCopy(item.password!)}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function AddItemDialog({ 
  open, 
  onOpenChange, 
  onSave 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onSave: (item: VaultItem) => void;
}) {
  const [type, setType] = useState<"password" | "note" | "card">("password");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [website, setWebsite] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setType("password");
    setName("");
    setUsername("");
    setPassword("");
    setWebsite("");
    setNoteContent("");
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/vault-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          name,
          username: type === "password" ? username : undefined,
          password: type === "password" ? password : undefined,
          website: type === "password" ? website : undefined,
          noteContent: type === "note" ? noteContent : undefined,
          cardNumber: type === "card" ? cardNumber : undefined,
          cardExpiry: type === "card" ? cardExpiry : undefined,
          cardCvv: type === "card" ? cardCvv : undefined,
        }),
      });
      if (res.ok) {
        const item = await res.json();
        onSave(item);
        resetForm();
      }
    } catch (err) {
      console.error("Failed to save item:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetForm(); }}>
      <DialogContent className="dark bg-card border-border">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="flex gap-2">
            {(["password", "note", "card"] as const).map((t) => (
              <Button
                key={t}
                variant={type === t ? "default" : "outline"}
                size="sm"
                onClick={() => setType(t)}
                className={type === t ? "bg-white text-black" : ""}
              >
                {t === "password" && <Key className="w-4 h-4 mr-1" />}
                {t === "note" && <FileText className="w-4 h-4 mr-1" />}
                {t === "card" && <CreditCard className="w-4 h-4 mr-1" />}
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Google Account" />
          </div>

          {type === "password" && (
            <>
              <div className="space-y-2">
                <Label>Username / Email</Label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label>Website (optional)</Label>
                <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" />
              </div>
            </>
          )}

          {type === "note" && (
            <div className="space-y-2">
              <Label>Note Content</Label>
              <Textarea value={noteContent} onChange={(e) => setNoteContent(e.target.value)} placeholder="Enter your secure note..." rows={4} />
            </div>
          )}

          {type === "card" && (
            <>
              <div className="space-y-2">
                <Label>Card Number</Label>
                <Input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="1234 5678 9012 3456" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Expiry</Label>
                  <Input value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} placeholder="MM/YY" />
                </div>
                <div className="space-y-2">
                  <Label>CVV</Label>
                  <Input value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} placeholder="123" />
                </div>
              </div>
            </>
          )}

          <Button onClick={handleSave} disabled={!name || saving} className="w-full bg-white text-black hover:bg-white/90">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save Item
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditItemDialog({ 
  item, 
  onOpenChange, 
  onSave 
}: { 
  item: VaultItem | null; 
  onOpenChange: (open: boolean) => void;
  onSave: (item: VaultItem) => void;
}) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [website, setWebsite] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setUsername(item.username || "");
      setPassword(item.password || "");
      setWebsite(item.website || "");
      setNoteContent(item.note_content || "");
      setCardNumber(item.card_number || "");
      setCardExpiry(item.card_expiry || "");
      setCardCvv(item.card_cvv || "");
    }
  }, [item]);

  const handleSave = async () => {
    if (!item) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/vault-items/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          username: item.type === "password" ? username : undefined,
          password: item.type === "password" ? password : undefined,
          website: item.type === "password" ? website : undefined,
          noteContent: item.type === "note" ? noteContent : undefined,
          cardNumber: item.type === "card" ? cardNumber : undefined,
          cardExpiry: item.type === "card" ? cardExpiry : undefined,
          cardCvv: item.type === "card" ? cardCvv : undefined,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        onSave(updated);
      }
    } catch (err) {
      console.error("Failed to update item:", err);
    } finally {
      setSaving(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent className="dark bg-card border-border" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          {item.type === "password" && (
            <>
              <div className="space-y-2">
                <Label>Username / Email</Label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input value={website} onChange={(e) => setWebsite(e.target.value)} />
              </div>
            </>
          )}

          {item.type === "note" && (
            <div className="space-y-2">
              <Label>Note Content</Label>
              <Textarea value={noteContent} onChange={(e) => setNoteContent(e.target.value)} rows={4} />
            </div>
          )}

          {item.type === "card" && (
            <>
              <div className="space-y-2">
                <Label>Card Number</Label>
                <Input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Expiry</Label>
                  <Input value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>CVV</Label>
                  <Input value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} />
                </div>
              </div>
            </>
          )}

          <Button onClick={handleSave} disabled={!name || saving} className="w-full bg-white text-black hover:bg-white/90">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ViewItemDialog({
  item,
  onOpenChange,
  onCopy,
  onEdit,
}: {
  item: VaultItem | null;
  onOpenChange: (open: boolean) => void;
  onCopy: (text: string) => void;
  onEdit: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showCvv, setShowCvv] = useState(false);

  useEffect(() => {
    if (!item) {
      setShowPassword(false);
      setShowCvv(false);
    }
  }, [item]);

  if (!item) return null;

  const getIcon = () => {
    switch (item.type) {
      case "password": return <Key className="w-6 h-6" />;
      case "note": return <FileText className="w-6 h-6" />;
      case "card": return <CreditCard className="w-6 h-6" />;
      default: return <Shield className="w-6 h-6" />;
    }
  };

  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent className="dark bg-card border-border max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white">
              {getIcon()}
            </div>
            <div>
              <DialogTitle className="text-xl">{item.name}</DialogTitle>
              <p className="text-sm text-muted-foreground capitalize">{item.type}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {item.type === "password" && (
            <>
              {item.username && (
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wide">Username / Email</Label>
                  <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                    <span className="font-mono text-sm">{item.username}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onCopy(item.username!)}>
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}
              {item.password && (
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wide">Password</Label>
                  <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                    <span className="font-mono text-sm">{showPassword ? item.password : "••••••••••••"}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onCopy(item.password!)}>
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              {item.website && (
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wide">Website</Label>
                  <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                    <a href={item.website.startsWith('http') ? item.website : `https://${item.website}`} target="_blank" rel="noopener noreferrer" className="font-mono text-sm text-blue-400 hover:underline">
                      {item.website}
                    </a>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onCopy(item.website!)}>
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {item.type === "note" && item.note_content && (
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs uppercase tracking-wide">Note</Label>
              <div className="bg-muted/50 rounded-lg px-3 py-3">
                <p className="text-sm whitespace-pre-wrap">{item.note_content}</p>
              </div>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => onCopy(item.note_content!)}>
                <Copy className="w-3.5 h-3.5 mr-2" />
                Copy Note
              </Button>
            </div>
          )}

          {item.type === "card" && (
            <>
              {item.card_number && (
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wide">Card Number</Label>
                  <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                    <span className="font-mono text-sm">{item.card_number}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onCopy(item.card_number!)}>
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {item.card_expiry && (
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">Expiry</Label>
                    <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                      <span className="font-mono text-sm">{item.card_expiry}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onCopy(item.card_expiry!)}>
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
                {item.card_cvv && (
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">CVV</Label>
                    <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                      <span className="font-mono text-sm">{showCvv ? item.card_cvv : "•••"}</span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowCvv(!showCvv)}>
                          {showCvv ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onCopy(item.card_cvv!)}>
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="pt-2">
            <Button onClick={onEdit} className="w-full bg-white text-black hover:bg-white/90">
              <Edit className="w-4 h-4 mr-2" />
              Edit Item
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
