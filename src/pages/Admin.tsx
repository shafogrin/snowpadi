import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  const checkAdminAndFetch = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setIsAdmin(true);
    fetchReports();
    fetchUsers();
    setLoading(false);
  };

  const fetchReports = async () => {
    const { data } = await supabase
      .from("reports")
      .select(`
        *,
        profiles!reports_reporter_id_fkey (username)
      `)
      .order("created_at", { ascending: false });

    if (data) {
      setReports(data);
    }
  };

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setUsers(data);
    }
  };

  const handleResolveReport = async (reportId: string) => {
    const { error } = await supabase
      .from("reports")
      .update({ status: "resolved", reviewed_at: new Date().toISOString() })
      .eq("id", reportId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to resolve report",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Report marked as resolved",
      });
      fetchReports();
    }
  };

  const handleDeleteContent = async (itemType: string, itemId: string, reportId: string) => {
    const table = itemType === "post" ? "posts" : "comments";
    const { error } = await supabase
      .from(table)
      .delete()
      .eq("id", itemId);

    if (error) {
      toast({
        title: "Error",
        description: `Failed to delete ${itemType}`,
        variant: "destructive",
      });
    } else {
      await supabase
        .from("reports")
        .update({ status: "resolved", reviewed_at: new Date().toISOString() })
        .eq("id", reportId);
      
      toast({
        title: "Success",
        description: `${itemType} deleted successfully`,
      });
      fetchReports();
    }
  };

  const handleBanUser = async (userId: string, isBanned: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_banned: !isBanned })
      .eq("id", userId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `User ${isBanned ? "unbanned" : "banned"} successfully`,
      });
      fetchUsers();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        <Tabs defaultValue="reports">
          <TabsList>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-4">
            {reports.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No reports to review
                </CardContent>
              </Card>
            ) : (
              reports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {report.reported_item_type} Report
                      </CardTitle>
                      <Badge variant={
                        report.status === "pending" ? "destructive" :
                        report.status === "reviewed" ? "default" : "secondary"
                      }>
                        {report.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Reported by {report.profiles.username} •{" "}
                        {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                      </p>
                      <p className="font-medium">Reason:</p>
                      <p className="text-muted-foreground">{report.reason}</p>
                    </div>
                    {report.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteContent(
                            report.reported_item_type,
                            report.reported_item_id,
                            report.id
                          )}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Content
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResolveReport(report.id)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark Resolved
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            {users.map((user) => (
              <Card key={user.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-muted-foreground">
                        Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {user.is_banned && (
                        <Badge variant="destructive">Banned</Badge>
                      )}
                      <Button
                        variant={user.is_banned ? "outline" : "destructive"}
                        size="sm"
                        onClick={() => handleBanUser(user.id, user.is_banned)}
                      >
                        {user.is_banned ? "Unban" : "Ban User"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
