import { useState } from "react";
import { Bell, CheckCircle, Store, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const placeholderNotifications = [
  { id: 1, type: "retailer", message: "PopMania UK added a new deal!", read: false },
  { id: 2, type: "user", message: "popfan99 followed you.", read: false },
  { id: 3, type: "retailer", message: "Vinyl Vault is live on Whatnot.", read: true },
];

const NotificationDropdown = () => {
  const [open, setOpen] = useState(false);
  const unreadCount = placeholderNotifications.filter(n => !n.read).length;

  return (
    <div className="relative inline-block text-left">
      <button
        className="relative focus:outline-none"
        onClick={() => setOpen(o => !o)}
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded shadow-lg z-50">
          <div className="p-4 border-b border-gray-700 font-bold text-white">Notifications</div>
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-800">
            {placeholderNotifications.length === 0 ? (
              <div className="p-4 text-gray-400 text-center">No notifications</div>
            ) : (
              placeholderNotifications.map(n => (
                <div key={n.id} className={`flex items-center gap-3 p-4 ${n.read ? "bg-gray-900" : "bg-gray-800/70"}`}>
                  {n.type === "retailer" ? (
                    <Store className="w-5 h-5 text-orange-400" />
                  ) : (
                    <User className="w-5 h-5 text-blue-400" />
                  )}
                  <div className="flex-1 text-white text-sm">{n.message}</div>
                  {!n.read && <Badge className="bg-orange-500 text-white text-xs">New</Badge>}
                </div>
              ))
            )}
          </div>
          <button className="w-full py-2 text-center text-orange-400 hover:underline bg-gray-900 rounded-b">View all</button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown; 