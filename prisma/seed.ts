import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123'
  const hashedPassword = await bcrypt.hash(defaultPassword, 10)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@snyk.io' },
    update: {},
    create: {
      email: 'admin@snyk.io',
      name: 'Admin User',
      password: hashedPassword,
      role: 'EDITOR',
    },
  })

  console.log('Created admin user:', adminUser.email)

  // Installation documents
  const installationDocs = [
    {
      title: 'Pre-Requisites',
      description: 'Requirements before installing Snyk ServiceNow integration including Enterprise license, redirect URL setup, and mandatory instance registration.',
      category: 'Installation',
      content: `User should have an Enterprise license to the Snyk Platform.

Your ServiceNow Redirect URL ("https://YOUR-INSTANCE.service-now.com/oauth_redirect.do") must be set up on the Snyk side.

**Action Required:** Contact servicenow@snyk.io to register your instance for the Snyk app. This is mandatory for new installations.`
    },
    {
      title: 'ServiceNow Plugins',
      description: 'Required ServiceNow plugin installation and activation steps for Vulnerability Response.',
      category: 'Installation',
      content: `The following ServiceNow plugin must be activated: **Vulnerability Response (com.snc.sn_vul) - min version(24.1.5)**

1. Log in to your instance with system admin credentials.
2. Navigate to "System Definition," and under it, select "Plugins".
3. Search for and install the plugin.`
    },
    {
      title: 'Application Installation from ServiceNow Store',
      description: 'Step-by-step guide to install Snyk Security for Application Vulnerability Response from ServiceNow Store.',
      category: 'Installation',
      content: `1. Go to the ServiceNow Store: https://store.servicenow.com.
2. Search for "Snyk Security for Application Vulnerability Response".
3. Click "Get" and enter your ServiceNow ID credentials.
4. In your instance, navigate to Applications > All Available Applications > All.
5. Find the application and click "Install".`
    },
    {
      title: 'Configuration: Snyk Base URL Change',
      description: 'How to configure the correct Snyk base URL for existing GCP customers vs new AWS customers.',
      category: 'Installation',
      content: `Snyk has migrated hosting for new customers. The default URL in the app is now the AWS URL: \`https://app.us.snyk.io\`.

**If you are an existing Snyk customer on GCP**, you must update the base URL. Log in to your Snyk account and check the URL. If it's \`app.snyk.io\`, you are on GCP.

**To update:** Open Global Settings in the Snyk app in ServiceNow and change the Base URL to \`app.snyk.io\`.`
    },
    {
      title: 'Generate REST/OAuth Token',
      description: 'Process to generate and authorize OAuth token for Snyk ServiceNow integration.',
      category: 'Installation',
      content: `1. Navigate to "Snyk Security for AppVR" > "Configuration" > "REST/OAuth Token".
2. Click on "Get OAuth Token".
3. You will be redirected to the Snyk App Authorization page.
4. Provide access to all organizations or a selected organization.
5. Click "Grant app access" to successfully authorize.`
    }
  ]

  // Troubleshooting documents
  const troubleshootingDocs = [
    {
      title: 'OAuth failures: Unable to generate the token',
      description: 'Solutions for OAuth token generation failures including invalid redirect URL errors and permission fixes.',
      category: 'Troubleshooting',
      content: `If you encounter an "Invalid Redirect URL" error or general token generation failures:

- **Verify Redirect URL:** Ensure your instance redirect URL (\`https://YOUR-INSTANCE.service-now.com/oauth_redirect.do\`) has been provided to the Snyk team by emailing servicenow@snyk.io.
- **Run Fix Script:** Navigate to "System Definition" > "Fix Scripts". Find and run the "Update Credentials" script.
- **Check Application Registry Permissions:**
  1. Go to "System OAuth" > "Application Registry".
  2. Right-click the header, select "Configure" > "Table".
  3. Under "Application Access", check the "Can Update" box and save.
- Attempt to generate the token again after performing these steps.`
    },
    {
      title: 'Integration is failing, but token was generated',
      description: 'Fix for integration failures when OAuth token exists but Run as field causes issues.',
      category: 'Troubleshooting',
      content: `The integration run can fail if a value is assigned in the "Run as" field in the integration configuration. Ensure this field is empty for all Snyk integrations.`
    },
    {
      title: 'Getting Reconcile-related errors while running integration',
      description: 'Resolution for reconcile errors caused by concurrent VR integration runs.',
      category: 'Troubleshooting',
      content: `This error occurs when multiple VR integrations are running simultaneously. Navigate to \`sn_sec_cmn_background_job.list\` and ensure all jobs are complete. Wait for important jobs to finish or mark unimportant ones as "complete" using a script if necessary.`
    },
    {
      title: 'Unable to ignore an issue from ServiceNow to Snyk (403 Error)',
      description: 'Configuration fix for 403 errors when trying to ignore issues from ServiceNow.',
      category: 'Troubleshooting',
      content: `In the Snyk platform, at the organization level, go to "Settings" > "Ignores". Under "Ability to ignore an issue...", you must select "All users in any environment".`
    },
    {
      title: 'Unable to Install from ServiceNow Store',
      description: 'Prerequisites and requirements for successful ServiceNow Store installation.',
      category: 'Troubleshooting',
      content: `First, verify you have the system administrator (admin) role. Then, ensure the 'Vulnerability Response' plugin is installed before attempting to install the Snyk application.`
    },
    {
      title: 'User Deletes Default Records (Application Registry, REST Message, etc.)',
      description: 'Recovery process when default integration records are accidentally deleted.',
      category: 'Troubleshooting',
      content: `If a user deletes the Application Registry, REST Message, or any of the default Integration records, the solution is to uninstall and then reinstall the Snyk application from the ServiceNow store.`
    },
    {
      title: 'Unable to see CVE & CWE in Third-Party Records',
      description: 'Configuration steps to display CVE and CWE information in third-party vulnerability records.',
      category: 'Troubleshooting',
      content: `Navigate to Application Vulnerability Response > Libraries > Third-Party. Open a third-party record, then use the context menu (hamburger icon) to navigate to Configure > Related Lists. Add 'CVE' and 'CWE' from the available slushbucket to the selected list and save.`
    },
    {
      title: '"Organizations not found" or Permission Errors During Auth',
      description: 'Understanding organization authorization limitations and proper setup.',
      category: 'Troubleshooting',
      content: `The Snyk App can only be authorized for a single organization or for all organizations within a group. If you attempt to authorize for multiple specific orgs (without using the "All Orgs" option), the authorization will only succeed for the last org selected.`
    }
  ]

  // Known Behaviors documents
  const knownBehaviorsDocs = [
    {
      title: 'Integration Failures on Concurrent Runs',
      description: 'Known limitation with concurrent integration runs due to OAuth2 mechanism.',
      category: 'Known Behaviors',
      content: `Due to ServiceNow's OAuth2 mechanism, Snyk integration runs can fail if multiple jobs are executed concurrently as the same user (e.g., VR.system). Avoid manually executing a Snyk import job when one is already in process.`
    },
    {
      title: 'AVIT State Not Updating from "Deferred" to "Open"',
      description: 'ServiceNow limitation preventing automatic state changes from Deferred to Open.',
      category: 'Known Behaviors',
      content: `If an AVIT is in a "Deferred" state, ServiceNow does not allow its state to be automatically changed to "Open" by the integration. This must be done manually.`
    },
    {
      title: 'Delays in Reflecting Ignored Issues',
      description: 'Expected delays for ignored issues to reflect in ServiceNow due to API limitations.',
      category: 'Known Behaviors',
      content: `Recently ignored SCA or IaC issues on the Snyk side could take up to **~5 hours** to reflect in the SCA V1 API and thus in ServiceNow.`
    },
    {
      title: '"Mark as False positive" or "Request Exception" for IaC issues',
      description: 'Limitation with IaC issue ignore functionality when using REST mechanism.',
      category: 'Known Behaviors',
      content: `If you are using the REST mechanism for fetching IaC issues, the integration does not support setting an ignore on the Snyk platform via these actions.`
    }
  ]

  // Create all documents
  const allDocs = [...installationDocs, ...troubleshootingDocs, ...knownBehaviorsDocs]
  
  for (const doc of allDocs) {
    await prisma.document.create({
      data: {
        title: doc.title,
        description: doc.description,
        category: doc.category,
        authorId: adminUser.id,
        published: true,
        sortOrder: 0,
      },
    })
  }

  console.log(`Created ${allDocs.length} documents from HTML content`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
