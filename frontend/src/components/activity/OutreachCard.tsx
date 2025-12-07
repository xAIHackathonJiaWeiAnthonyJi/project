import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Twitter, MessageSquare, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OutreachEvent {
  id: string;
  type: "tweet_sent" | "dm_received";
  username: string;
  name?: string;
  message: string;
  timestamp: Date;
  tweetId?: string;
  recommendation?: string;
  sentiment?: string;
}

interface OutreachCardProps {
  event: OutreachEvent;
}

export function OutreachCard({ event }: OutreachCardProps) {
  const isTweet = event.type === "tweet_sent";
  const isDM = event.type === "dm_received";
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  
  const getSentimentColor = (sentiment?: string) => {
    if (sentiment === "positive") return "text-success";
    if (sentiment === "negative") return "text-destructive";
    return "text-muted-foreground";
  };
  
  return (
    <Card className="p-4 bg-card border-border hover:border-primary/50 transition-colors">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {event.name ? getInitials(event.name) : event.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {event.name || event.username}
                </span>
                <span className="text-xs text-muted-foreground">
                  @{event.username}
                </span>
                {event.recommendation && (
                  <Badge variant="secondary" className="text-xs">
                    {event.recommendation}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                {isTweet && <Twitter className="h-3 w-3 text-muted-foreground" />}
                {isDM && <MessageSquare className="h-3 w-3 text-muted-foreground" />}
                <span className="text-xs text-muted-foreground">
                  {event.timestamp.toLocaleString()}
                </span>
              </div>
            </div>
            
            {event.tweetId && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2"
                onClick={() => window.open(`https://twitter.com/anyuser/status/${event.tweetId}`, '_blank')}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          {/* Message */}
          <div className={`text-sm ${isDM ? getSentimentColor(event.sentiment) : "text-muted-foreground"}`}>
            {isDM && <MessageSquare className="h-4 w-4 inline mr-1.5" />}
            {event.message}
          </div>
        </div>
      </div>
    </Card>
  );
}

