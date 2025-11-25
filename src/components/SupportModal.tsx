import { X, Mail, MessageCircle, FileText, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'help' | 'about';
}

export function SupportModal({ isOpen, onClose, type }: SupportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {type === 'help' ? 'Help & Support' : 'About Pantrix'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {type === 'help' ? (
          <div className="space-y-4">
            <p className="text-muted-foreground mb-6">
              Need help? We're here to assist you!
            </p>

            {/* Contact Options */}
            <div className="space-y-3">
              <a
                href="mailto:support@pantrix.app"
                className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm text-muted-foreground">
                    support@pantrix.app
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </a>

              <button className="w-full flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">Live Chat</p>
                  <p className="text-sm text-muted-foreground">
                    Available Mon-Fri, 9am-5pm EST
                  </p>
                </div>
              </button>

              <a
                href="https://pantrix.app/faq"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">FAQ & Guides</p>
                  <p className="text-sm text-muted-foreground">
                    Browse common questions
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </a>
            </div>

            {/* Common Topics */}
            <div className="mt-6">
              <h3 className="font-medium mb-3">Common Topics</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  How to scan receipts
                </button>
                <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  Managing household members
                </button>
                <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  Setting up notifications
                </button>
                <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  Understanding expiry dates
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Logo/Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-3xl font-bold">
                P
              </div>
            </div>

            {/* App Info */}
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Pantrix</h3>
              <p className="text-muted-foreground mb-1">Version 1.0.0</p>
              <p className="text-sm text-muted-foreground">
                Smart Food Inventory Management
              </p>
            </div>

            {/* Description */}
            <div className="space-y-3 text-sm">
              <p>
                Pantrix helps you reduce food waste by keeping track of your
                inventory, alerting you before items expire, and suggesting
                recipes based on what you have.
              </p>
              <p>
                With AI-powered receipt scanning and smart categorization,
                managing your pantry has never been easier.
              </p>
            </div>

            {/* Features */}
            <div>
              <h4 className="font-medium mb-2">Key Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  <span>AI-powered receipt scanning</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  <span>Expiry date tracking & alerts</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  <span>Household inventory sharing</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  <span>Smart shopping lists</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  <span>Recipe suggestions</span>
                </li>
              </ul>
            </div>

            {/* Links */}
            <div className="pt-4 border-t space-y-2 text-sm">
              <a
                href="https://pantrix.app/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors"
              >
                <span>Privacy Policy</span>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </a>
              <a
                href="https://pantrix.app/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors"
              >
                <span>Terms of Service</span>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </a>
            </div>

            {/* Copyright */}
            <p className="text-center text-xs text-muted-foreground pt-4">
              © 2024 Pantrix. All rights reserved.
            </p>
          </div>
        )}

        {/* Close Button */}
        <Button onClick={onClose} className="w-full mt-6">
          Close
        </Button>
      </div>
    </div>
  );
}

