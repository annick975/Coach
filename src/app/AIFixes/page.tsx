"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  ArrowLeft,
  Download,
  Shield,
  ShieldCheck,
  FileX,
  Code,
  FileCheck,
  ThumbsUp,
  Copy,
  Terminal,
  Check,
  Info,
  ChevronDown,
  ChevronUp,
  FileCode,
  Zap,
  ArrowRight,
} from "lucide-react";

// Mock data for AI fixes
const mockAIFixes = {
  repoName: "username/repository",
  scanTimestamp: new Date().toISOString(),
  totalIssuesFixed: 4,
  totalIssuesDetected: 12,
  fixes: [
    {
      id: 1,
      file: "src/auth.js",
      line: 45,
      severity: "high",
      vulnerability: "Insecure authentication method",
      impact: "Could allow unauthorized access to user accounts",
      cveId: "CVE-2023-1234",
      originalCode: `function authenticateUser(username, password) {
  // Insecure method - using MD5 for password hashing
  const hashedPassword = md5(password);
  
  // Checking credentials without proper sanitization
  const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + hashedPassword + "'";
  return db.execute(query);
}`,
      fixCode: `function authenticateUser(username, password) {
  // Using secure password hashing with bcrypt
  return db.collection('users')
    .findOne({ username: username })
    .then(user => {
      if (!user) return null;
      // Compare password with stored hash
      return bcrypt.compare(password, user.password)
        .then(isMatch => {
          return isMatch ? user : null;
        });
    });
}`,
      explanation: "The original code has multiple security issues: it uses MD5 (which is cryptographically broken), lacks proper parameter sanitization, and is vulnerable to SQL injection. The fix uses parameterized queries and bcrypt for secure password hashing, which is industry standard. It also handles authentication through promises and avoids string concatenation for queries.",
      additionalRecommendations: ["Implement rate limiting to prevent brute force attacks", "Add multi-factor authentication", "Consider using a token-based authentication system like JWT"]
    },
    {
      id: 2,
      file: "src/api/users.js",
      line: 23,
      severity: "high",
      vulnerability: "SQL injection vulnerability",
      impact: "Allows attackers to execute arbitrary SQL commands",
      cveId: "CVE-2023-5678",
      originalCode: `app.get('/api/users/search', (req, res) => {
  const searchTerm = req.query.term;
  const query = \`SELECT * FROM users WHERE name LIKE '%\${searchTerm}%' OR email LIKE '%\${searchTerm}%'\`;
  
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(results);
  });
});`,
      fixCode: `app.get('/api/users/search', (req, res) => {
  const searchTerm = req.query.term;
  
  // Using parameterized query to prevent SQL injection
  const query = "SELECT * FROM users WHERE name LIKE ? OR email LIKE ?";
  const params = [\`%\${searchTerm}%\`, \`%\${searchTerm}%\`];
  
  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: 'An error occurred' });
    return res.json(results);
  });
});`,
      explanation: "The original code directly interpolates user input into the SQL query, making it vulnerable to SQL injection attacks. The fix uses parameterized queries which separate the SQL command from the data, effectively preventing SQL injection. Also, the error message has been generalized to avoid exposing internal system details.",
      additionalRecommendations: ["Implement input validation", "Consider using an ORM like Sequelize or Prisma", "Add rate limiting to API endpoints"]
    },
    {
      id: 3,
      file: "src/utils/validation.js",
      line: 12,
      severity: "medium",
      vulnerability: "Improper input validation",
      impact: "May lead to various injection attacks",
      cveId: null,
      originalCode: `function validateUserInput(input) {
  // Basic check if input exists
  if (!input) return false;
  
  // Remove some potentially dangerous characters
  input = input.replace(/[<>"']/g, '');
  
  return input;
}`,
      fixCode: `function validateUserInput(input, options = {}) {
  // Check if input exists
  if (input === undefined || input === null) {
    return false;
  }
  
  // Convert to string if not already
  const strInput = String(input);
  
  // Define allowed pattern based on context
  const pattern = options.pattern || /^[a-zA-Z0-9 .,!?()-]+$/;
  
  // Validate against pattern
  if (!pattern.test(strInput)) {
    return false;
  }
  
  return strInput;
}`,
      explanation: "The original validation function was inadequate as it only removed a few characters but still allowed many potentially dangerous inputs. The fix implements a whitelist approach that only accepts known safe characters by default, and allows customization through a pattern option. This is more secure as it rejects anything not explicitly allowed.",
      additionalRecommendations: ["Use context-specific validation rules", "Consider using a validation library like Joi or Yup", "Validate on both client and server sides"]
    },
    {
      id: 5,
      file: "src/middleware/logger.js",
      line: 34,
      severity: "medium",
      vulnerability: "Information exposure through logs",
      impact: "Sensitive data might be exposed in application logs",
      cveId: null,
      originalCode: `function logRequest(req, res, next) {
  console.log(\`[REQUEST] \${new Date().toISOString()} - \${req.method} \${req.url}\`);
  console.log(\`[HEADERS] \${JSON.stringify(req.headers)}\`);
  console.log(\`[BODY] \${JSON.stringify(req.body)}\`);
  
  next();
}`,
      fixCode: `function logRequest(req, res, next) {
  // Log basic request info without sensitive data
  console.log(\`[REQUEST] \${new Date().toISOString()} - \${req.method} \${req.url}\`);
  
  // Sanitize headers before logging (remove authorization data)
  const sanitizedHeaders = { ...req.headers };
  delete sanitizedHeaders.authorization;
  delete sanitizedHeaders.cookie;
  console.log(\`[HEADERS] \${JSON.stringify(sanitizedHeaders)}\`);
  
  // Sanitize body - mask sensitive fields
  let sanitizedBody = null;
  if (req.body) {
    sanitizedBody = { ...req.body };
    // Mask sensitive fields
    ['password', 'token', 'secret', 'creditCard', 'ssn'].forEach(field => {
      if (sanitizedBody[field]) sanitizedBody[field] = '********';
    });
  }
  console.log(\`[BODY] \${JSON.stringify(sanitizedBody)}\`);
  
  next();
}`,
      explanation: "The original code logs all headers and body content without filtering sensitive information, which could lead to exposure of passwords, tokens, and personal information in log files. The fix sanitizes headers by removing authorization and cookie data, and masks known sensitive fields in the request body to prevent accidental exposure.",
      additionalRecommendations: ["Use a structured logging library", "Configure proper log rotation and access controls", "Consider different log levels for different environments"]
    }
  ]
};

export default function AIFixesPage() {
  const searchParams = useSearchParams();
  const repoUrl = searchParams.get("repo");
  const [fixes, setFixes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedFixes, setExpandedFixes] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const fetchFixes = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        setFixes(mockAIFixes);
        
        // Initialize expanded state for all fixes (default to collapsed)
        const initialExpandedState = {};
        mockAIFixes.fixes.forEach(fix => {
          initialExpandedState[fix.id] = false;
        });
        setExpandedFixes(initialExpandedState);
      } catch (err) {
        setError("Failed to load AI fixes");
      } finally {
        setLoading(false);
      }
    };

    fetchFixes();
  }, []);

  // Toggle expansion of fix details
  const toggleExpand = (id) => {
    setExpandedFixes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Copy fix code to clipboard
  const copyToClipboard = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Background pattern for cyber theme
  const cyberPattern = `linear-gradient(to right, rgba(16, 24, 39, 0.9), rgba(16, 24, 39, 0.92)), 
                         url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232563eb' fill-opacity='0.12'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

  // Loading state
  if (loading) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center"
        style={{ background: cyberPattern }}
      >
        <div className="max-w-md w-full px-6 py-8 rounded-lg bg-black/50 backdrop-blur-md border border-blue-500/30 shadow-lg shadow-blue-500/10">
          <div className="flex flex-col items-center justify-center space-y-6 text-center">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
              <div
                className="absolute inset-2 rounded-full border-t-2 border-cyan-400 animate-spin"
                style={{ animationDuration: "3s" }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Code className="h-12 w-12 text-blue-400" />
              </div>
            </div>

            <h2 className="text-xl font-mono font-semibold text-white">
              Generating AI Security Fixes
            </h2>

            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm text-blue-300">
                <span>0%</span>
                <span>Analyzing Code</span>
                <span>100%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full animate-pulse"
                  style={{ width: `70%` }}
                ></div>
              </div>
            </div>

            <div className="text-sm text-blue-300 font-mono">
              [STATUS] Optimizing security patches...
            </div>

            <div className="flex space-x-3 pt-2">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
              <div
                className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center"
        style={{ background: cyberPattern }}
      >
        <div className="max-w-md w-full px-6 py-8 rounded-lg bg-black/50 backdrop-blur-md border border-red-500/30 shadow-lg shadow-red-500/10">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full border border-red-500/50 flex items-center justify-center mb-6">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-mono font-semibold text-white mb-2">
              FIX GENERATION FAILED
            </h2>
            <div className="bg-red-900/20 border border-red-500/30 w-full p-3 rounded mb-6">
              <p className="text-red-300 font-mono">[ERROR]: {error}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => window.history.back()}
                className="bg-gray-900 hover:bg-gray-800 text-gray-100 border border-gray-700 font-mono flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Return to Scan Results
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!fixes) return null;

  const getSeverityData = (severity) => {
    switch (severity) {
      case "high":
        return {
          color: "text-red-400",
          bgColor: "bg-red-900/30",
          borderColor: "border-red-500/30",
          icon: <FileX className="h-5 w-5 text-red-400" />,
          label: "HIGH",
        };
      case "medium":
        return {
          color: "text-yellow-400",
          bgColor: "bg-yellow-900/30",
          borderColor: "border-yellow-500/30",
          icon: <FileX className="h-5 w-5 text-yellow-400" />,
          label: "MEDIUM",
        };
      case "low":
        return {
          color: "text-blue-400",
          bgColor: "bg-blue-900/30",
          borderColor: "border-blue-500/30",
          icon: <FileX className="h-5 w-5 text-blue-400" />,
          label: "LOW",
        };
      default:
        return {
          color: "text-gray-400",
          bgColor: "bg-gray-900/30",
          borderColor: "border-gray-500/30",
          icon: <FileX className="h-5 w-5 text-gray-400" />,
          label: "UNKNOWN",
        };
    }
  };

  return (
    <div className="min-h-screen w-full" style={{ background: cyberPattern }}>
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block bg-black/40 backdrop-blur-sm p-3 rounded-lg border border-blue-500/30 mb-6">
            <div className="flex items-center justify-center gap-3">
              <Shield className="h-8 w-8 text-blue-400" />
              <h1 className="text-3xl font-mono font-bold text-white">COACH</h1>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-x-6 gap-y-2 text-blue-300 font-mono mb-8">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              <span>{fixes.repoName}</span>
            </div>
            <div className="hidden sm:block h-1 w-1 rounded-full bg-blue-500"></div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{new Date(fixes.scanTimestamp).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Button
              onClick={() => window.history.back()}
              className="bg-gray-900 hover:bg-gray-800 text-gray-100 border border-gray-700 font-mono flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Results
            </Button>
            <Button className="bg-gray-900 hover:bg-gray-800 text-gray-100 border border-gray-700 font-mono flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Fixes
            </Button>
            <Button className="bg-green-900/50 hover:bg-green-800 text-green-100 border border-green-600/30 font-mono flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Apply All Fixes
            </Button>
          </div>
        </div>

        {/* Fix Summary */}
        <div className="mb-10">
          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/30 p-8 max-w-4xl mx-auto hover:shadow-lg hover:shadow-blue-500/10 transition-all">
            <h2 className="text-white font-mono text-xl text-center mb-6">
              AI SECURITY FIXES
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-black/60 to-green-950/30 rounded-lg border border-green-500/30 p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-green-900/30 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="h-8 w-8 text-green-400" />
                </div>
                <div className="text-3xl font-mono font-bold text-green-400">
                  {fixes.fixes.length}
                </div>
                <div className="text-green-300 font-mono mt-2">FIXES GENERATED</div>
                <div className="text-xs text-green-400/70 mt-2">
                  Ready to apply
                </div>
              </div>

              <div className="bg-gradient-to-br from-black/60 to-blue-950/30 rounded-lg border border-blue-500/30 p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-blue-900/30 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
                  <Code className="h-8 w-8 text-blue-400" />
                </div>
                <div className="text-3xl font-mono font-bold text-blue-400">
                  {fixes.fixes.reduce((sum, fix) => sum + (fix.additionalRecommendations?.length || 0), 0)}
                </div>
                <div className="text-blue-300 font-mono mt-2">RECOMMENDATIONS</div>
                <div className="text-xs text-blue-400/70 mt-2">
                  Further security enhancements
                </div>
              </div>

              <div className="bg-gradient-to-br from-black/60 to-purple-950/30 rounded-lg border border-purple-500/30 p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-purple-900/30 border border-purple-500/30 flex items-center justify-center mx-auto mb-4">
                  <ThumbsUp className="h-8 w-8 text-purple-400" />
                </div>
                <div className="text-3xl font-mono font-bold text-purple-400">
                  {Math.round((fixes.fixes.length / fixes.totalIssuesDetected) * 100)}%
                </div>
                <div className="text-purple-300 font-mono mt-2">ISSUES ADDRESSED</div>
                <div className="text-xs text-purple-400/70 mt-2">
                  Of all detected vulnerabilities
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Info className="h-5 w-5 text-blue-400" />
                <h3 className="text-blue-300 font-mono">AI SECURITY ANALYSIS</h3>
              </div>
              <p className="text-blue-100 text-sm leading-relaxed">
                Our AI has analyzed your codebase and identified {fixes.totalIssuesDetected} security vulnerabilities. We've generated fixes for {fixes.fixes.length} critical issues that address common security problems including SQL injection, authentication weaknesses, and sensitive data exposure. Applying these fixes will significantly improve your application's security posture. Review each fix below and apply them to strengthen your codebase.
              </p>
            </div>
          </div>
        </div>

        {/* Security Fixes */}
        <div className="mb-10">
          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden">
            <div className="p-6 border-b border-blue-500/20">
              <h2 className="text-white font-mono text-xl text-center">
                GENERATED SECURITY FIXES
              </h2>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <div className="flex justify-center px-6 pt-4">
                <TabsList className="bg-gray-900 border border-blue-500/20">
                  <TabsTrigger
                    value="all"
                    className="data-[state=active]:bg-blue-900/70 data-[state=active]:text-blue-200 font-mono"
                  >
                    ALL FIXES ({fixes.fixes.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="high"
                    className="data-[state=active]:bg-red-900/70 data-[state=active]:text-red-200 font-mono"
                  >
                    HIGH ({fixes.fixes.filter(fix => fix.severity === 'high').length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="medium"
                    className="data-[state=active]:bg-yellow-900/70 data-[state=active]:text-yellow-200 font-mono"
                  >
                    MEDIUM ({fixes.fixes.filter(fix => fix.severity === 'medium').length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="low"
                    className="data-[state=active]:bg-blue-900/70 data-[state=active]:text-blue-200 font-mono"
                  >
                    LOW ({fixes.fixes.filter(fix => fix.severity === 'low').length})
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="p-4">
                <div className="space-y-6">
                  {fixes.fixes.map((fix) => renderFixCard(fix))}
                </div>
              </TabsContent>

              <TabsContent value="high" className="p-4">
                <div className="space-y-6">
                  {fixes.fixes
                    .filter((fix) => fix.severity === "high")
                    .map((fix) => renderFixCard(fix))}
                </div>
              </TabsContent>

              <TabsContent value="medium" className="p-4">
                <div className="space-y-6">
                  {fixes.fixes
                    .filter((fix) => fix.severity === "medium")
                    .map((fix) => renderFixCard(fix))}
                </div>
              </TabsContent>

              <TabsContent value="low" className="p-4">
                <div className="space-y-6">
                  {fixes.fixes
                    .filter((fix) => fix.severity === "low")
                    .map((fix) => renderFixCard(fix))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );

  function renderFixCard(fix) {
  const severityData = getSeverityData(fix.severity);
  const isExpanded = expandedFixes[fix.id];
  
  return (
    <div
      key={fix.id}
      className={`bg-black/40 backdrop-blur-sm rounded-lg border ${isExpanded ? 'border-blue-500/40' : 'border-blue-500/20'} overflow-hidden transition-all duration-300 hover:shadow-md hover:shadow-blue-500/10`}
    >
      {/* Fix Header - Always Visible */}
      <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer" onClick={() => toggleExpand(fix.id)}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className={`${severityData.bgColor} ${severityData.borderColor} border rounded-lg p-2 flex-shrink-0`}>
            {severityData.icon}
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`font-mono text-sm ${severityData.color}`}>
                {severityData.label}
              </span>
              {fix.cveId && (
                <span className="bg-blue-900/30 border border-blue-500/30 rounded px-2 py-0.5 text-xs font-mono text-blue-300">
                  {fix.cveId}
                </span>
              )}
            </div>
            <h3 className="text-white font-mono text-md mb-1">{fix.vulnerability}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <FileCode className="h-4 w-4 text-gray-400" />
              <span>{fix.file}</span>
              <span className="bg-gray-800 px-2 py-0.5 rounded text-xs">Line {fix.line}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="bg-green-900/40 hover:bg-green-800 text-green-100 border border-green-500/30 font-mono text-xs"
          >
            <ShieldCheck className="h-3 w-3 mr-1" />
            Apply Fix
          </Button>
          
          <div className={`h-8 w-8 rounded-full flex items-center justify-center border ${isExpanded ? 'border-blue-500/50 bg-blue-900/30' : 'border-gray-700 bg-black/50'}`}>
            {isExpanded ? <ChevronUp className="h-4 w-4 text-blue-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
          </div>
        </div>
      </div>
      
      {/* Expandable Content */}
      {isExpanded && (
        <div className="border-t border-blue-500/20">
          {/* Vulnerability Information */}
          <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-900/50 to-gray-900/30 border-b border-blue-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-4 w-4 text-blue-400" />
              <h4 className="text-blue-300 font-mono">VULNERABILITY DETAILS</h4>
            </div>
            <p className="text-gray-300 text-sm mb-4">{fix.impact}</p>
            
            <div className="bg-red-900/10 border border-red-500/20 rounded p-3 mb-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileX className="h-4 w-4 text-red-400" />
                  <h5 className="text-red-300 font-mono text-sm">VULNERABLE CODE</h5>
                </div>
                <Button
                  size="sm"
                  className="h-7 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 font-mono text-xs"
                  onClick={() => copyToClipboard(fix.originalCode, `original-${fix.id}`)}
                >
                  {copiedId === `original-${fix.id}` ? (
                    <Check className="h-3 w-3 mr-1" />
                  ) : (
                    <Copy className="h-3 w-3 mr-1" />
                  )}
                  {copiedId === `original-${fix.id}` ? "Copied" : "Copy"}
                </Button>
              </div>
              <pre className="bg-black/80 p-3 rounded overflow-x-auto text-xs text-red-300 font-mono">{fix.originalCode}</pre>
            </div>
            
            <div className="bg-green-900/10 border border-green-500/20 rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-green-400" />
                  <h5 className="text-green-300 font-mono text-sm">FIXED CODE</h5>
                </div>
                <Button
                  size="sm"
                  className="h-7 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 font-mono text-xs"
                  onClick={() => copyToClipboard(fix.fixCode, `fix-${fix.id}`)}
                >
                  {copiedId === `fix-${fix.id}` ? (
                    <Check className="h-3 w-3 mr-1" />
                  ) : (
                    <Copy className="h-3 w-3 mr-1" />
                  )}
                  {copiedId === `fix-${fix.id}` ? "Copied" : "Copy"}
                </Button>
              </div>
              <pre className="bg-black/80 p-3 rounded overflow-x-auto text-xs text-green-300 font-mono">{fix.fixCode}</pre>
            </div>
          </div>
          
          {/* Explanation */}
          <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-900/10 to-blue-900/5 border-b border-blue-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-blue-400" />
              <h4 className="text-blue-300 font-mono">FIX EXPLANATION</h4>
            </div>
            <p className="text-gray-300 text-sm">{fix.explanation}</p>
          </div>
          
          {/* Additional Recommendations */}
          {fix.additionalRecommendations && fix.additionalRecommendations.length > 0 && (
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-purple-400" />
                <h4 className="text-purple-300 font-mono">ADDITIONAL RECOMMENDATIONS</h4>
              </div>
              <ul className="space-y-2">
                {fix.additionalRecommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-300 text-sm">
                    <ArrowRight className="h-4 w-4 text-purple-400 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}