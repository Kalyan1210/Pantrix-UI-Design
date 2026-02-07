import React from 'react';
import { Mail, MessageCircle, FileText, ExternalLink, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { IOSModal } from './ui/ios-modal';
import { hapticLight } from '../lib/haptics';
import { toast } from 'sonner';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'help' | 'about';
}

export function SupportModal({ isOpen, onClose, type }: SupportModalProps) {
  const handleContactOption = (option: string) => {
    hapticLight();
    toast.info(`Opening ${option}...`);
  };

  const handleTopicClick = (topic: string) => {
    hapticLight();
    toast.info(`Loading article: ${topic}`);
  };

  return (
    <IOSModal
      isOpen={isOpen}
      onClose={onClose}
      title={type === 'help' ? 'Help & Support' : 'About Pantrix'}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {type === 'help' ? (
            <div className="space-y-6">
              <p className="text-muted-foreground">
                Need help? We're here to assist you!
              </p>

              {/* Contact Options */}
              <div className="space-y-3">
                <a
                  href="mailto:support@pantrix.app"
                  onClick={() => handleContactOption('Email')}
                  className="flex items-center gap-4 p-4 rounded-2xl border hover:bg-muted/50 transition-colors active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Email Support</p>
                    <p className="text-sm text-muted-foreground">
                      support@pantrix.app
                    </p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-muted-foreground" />
                </a>

                <button 
                  onClick={() => handleContactOption('Live Chat')}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border hover:bg-muted/50 transition-colors active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">Live Chat</p>
                    <p className="text-sm text-muted-foreground">
                      Mon-Fri, 9am-5pm EST
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>

                <a
                  href="https://pantrix.app/faq"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleContactOption('FAQ')}
                  className="flex items-center gap-4 p-4 rounded-2xl border hover:bg-muted/50 transition-colors active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">FAQ & Guides</p>
                    <p className="text-sm text-muted-foreground">
                      Browse common questions
                    </p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-muted-foreground" />
                </a>
              </div>

              {/* Common Topics */}
              <div>
                <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                  Common Topics
                </h3>
                <div className="bg-card border rounded-2xl divide-y overflow-hidden">
                  {[
                    'How to scan receipts',
                    'Managing household members',
                    'Setting up notifications',
                    'Understanding expiry dates',
                  ].map((topic, index) => (
                    <button
                      key={index}
                      onClick={() => handleTopicClick(topic)}
                      className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/50 transition-colors text-left"
                    >
                      <span className="text-sm font-medium">{topic}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Logo/Icon */}
              <div className="flex justify-center pt-2">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  P
                </div>
              </div>

              {/* App Info */}
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-1">Pantrix</h3>
                <p className="text-muted-foreground text-sm">Version 1.0.0</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Smart Food Inventory Management
                </p>
              </div>

              {/* Description */}
              <div className="bg-muted/30 rounded-2xl p-4 space-y-3 text-sm">
                <p>
                  Pantrix helps you reduce food waste by keeping track of your
                  inventory, alerting you before items expire, and suggesting
                  recipes based on what you have.
                </p>
                <p className="text-muted-foreground">
                  With AI-powered receipt scanning and smart categorization,
                  managing your pantry has never been easier.
                </p>
              </div>

              {/* Features */}
              <div>
                <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                  Key Features
                </h4>
                <ul className="space-y-3">
                  {[
                    'AI-powered receipt scanning',
                    'Expiry date tracking & alerts',
                    'Household inventory sharing',
                    'Smart shopping lists',
                    'Recipe suggestions',
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Links */}
              <div className="border rounded-2xl divide-y overflow-hidden">
                <a
                  href="https://pantrix.app/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-4 py-3.5 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-medium">Privacy Policy</span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </a>
                <a
                  href="https://pantrix.app/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-4 py-3.5 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-medium">Terms of Service</span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </a>
              </div>

              {/* Copyright */}
              <p className="text-center text-xs text-muted-foreground">
                © 2024 Pantrix. All rights reserved.
              </p>
            </div>
          )}
        </div>

        {/* Close Button - Fixed at bottom */}
        <div className="px-4 py-4 border-t bg-card">
          <Button onClick={onClose} className="w-full h-12 rounded-xl text-base font-semibold">
            Close
          </Button>
        </div>
      </div>
    </IOSModal>
  );
}
