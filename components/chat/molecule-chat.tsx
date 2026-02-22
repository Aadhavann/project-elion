"use client";

import { useState, useCallback } from "react";
import type { ChatMessage, DesignSuggestion, StartingMolecule } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Send, Trash2, Sparkles, MessageSquare } from "lucide-react";

interface MoleculeChatProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (content: string) => void;
  onApplyMolecule: (smiles: string) => void;
  onClear: () => void;
}

const suggestionTypeColor: Record<string, string> = {
  modify: "bg-warning/10 text-warning border-warning/30",
  add: "bg-success/10 text-success border-success/30",
  remove: "bg-destructive/10 text-destructive border-destructive/30",
  general: "bg-primary/10 text-primary border-primary/30",
};

const EXAMPLE_PROMPTS = [
  "I need a non-drowsy antihistamine",
  "What properties does this molecule have?",
  "Suggest modifications to improve BBB penetration",
];

export function MoleculeChat({
  messages,
  isLoading,
  onSendMessage,
  onApplyMolecule,
  onClear,
}: MoleculeChatProps) {
  const [input, setInput] = useState("");

  const handleSend = useCallback(() => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput("");
    }
  }, [input, isLoading, onSendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <Card className="flex flex-col h-[450px] overflow-hidden p-0">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-1.5">
          <MessageSquare className="size-3.5 text-primary" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
            TxGemma Assistant
          </span>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            onClick={onClear}
          >
            <Trash2 className="size-3" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-3 p-3">
          {messages.length === 0 && !isLoading ? (
            <EmptyState onPromptClick={onSendMessage} />
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onApplyMolecule={onApplyMolecule}
                />
              ))}
              {isLoading && <TypingIndicator />}
            </>
          )}

        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border p-2 flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about molecules or design strategy..."
          disabled={isLoading}
          className="min-h-[36px] max-h-[72px] text-xs resize-none py-2"
        />
        <Button
          size="sm"
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="self-end h-9 px-3"
        >
          <Send className="size-3.5" />
        </Button>
      </div>
    </Card>
  );
}

function EmptyState({ onPromptClick }: { onPromptClick: (prompt: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
      <MessageSquare className="size-6 text-muted-foreground/40" />
      <p className="text-[10px] text-muted-foreground">
        Ask about drug design, molecular properties, or get design guidance.
      </p>
      <div className="flex flex-wrap justify-center gap-1.5">
        {EXAMPLE_PROMPTS.map((prompt, i) => (
          <Button
            key={i}
            variant="outline"
            size="sm"
            className="h-6 text-[10px] px-2"
            onClick={() => onPromptClick(prompt)}
          >
            {prompt}
          </Button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  onApplyMolecule,
}: {
  message: ChatMessage;
  onApplyMolecule: (smiles: string) => void;
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-lg bg-primary px-3 py-2 text-xs text-primary-foreground">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Avatar className="size-6 shrink-0">
        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
          Tx
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-1.5 max-w-[85%]">
        {message.content && (
          <div className="rounded-lg bg-muted px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
        )}
        {message.structuredContent?.suggestions &&
          message.structuredContent.suggestions.length > 0 && (
            <SuggestionChips suggestions={message.structuredContent.suggestions} />
          )}
        {message.structuredContent?.molecules &&
          message.structuredContent.molecules.length > 0 && (
            <MoleculeButtons
              molecules={message.structuredContent.molecules}
              onApply={onApplyMolecule}
            />
          )}
      </div>
    </div>
  );
}

function SuggestionChips({ suggestions }: { suggestions: DesignSuggestion[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {suggestions.map((s, i) => (
        <Badge
          key={i}
          variant="outline"
          className={`text-[10px] ${suggestionTypeColor[s.type] || suggestionTypeColor.general}`}
        >
          {s.text}
        </Badge>
      ))}
    </div>
  );
}

function MoleculeButtons({
  molecules,
  onApply,
}: {
  molecules: StartingMolecule[];
  onApply: (smiles: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {molecules.map((mol, i) => (
        <Button
          key={i}
          variant="outline"
          size="sm"
          className="h-6 gap-1 text-[10px]"
          onClick={() => onApply(mol.smiles)}
        >
          <Sparkles className="size-3" />
          {mol.name}
        </Button>
      ))}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2">
      <Avatar className="size-6 shrink-0">
        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
          Tx
        </AvatarFallback>
      </Avatar>
      <div className="rounded-lg bg-muted px-3 py-2 flex items-center gap-1">
        <span className="size-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
        <span className="size-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
        <span className="size-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}
