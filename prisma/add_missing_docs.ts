import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Get the admin user
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@snyk.io' }
  })

  if (!adminUser) {
    console.error('Admin user not found')
    return
  }

  // Additional troubleshooting documents from PDF Section 7 that are missing from seed
  const missingTroubleshootingDocs = [
    {
      title: 'Unable to create a new user',
      description: 'Reference guide for creating new users in ServiceNow.',
      category: 'Troubleshooting',
      content: `Review the following link and execute the steps:
https://www.servicenow.com/docs/bundle/washingtondc-customer-service-management/page/administer/users-and-groups/task/t_CreateAUser.html`
    },
    {
      title: 'Unable to install/activate the plugin in ServiceNow Instance',
      description: 'Reference guide for installing and activating plugins in ServiceNow.',
      category: 'Troubleshooting',
      content: `Review the following link and execute the steps:
https://docs.servicenow.com/bundle/xanadu-platform-administration/page/administer/plugins/task/t_ActivateAPlugin.html`
    },
    {
      title: 'Unable to search Lifecycle & Environment from AVIT',
      description: 'Steps to configure AVIT filters to show Lifecycle and Environment fields.',
      category: 'Troubleshooting',
      content: `1. Navigate to Application Vulnerable items.
2. Click on the Show/Hide Filter icon from the top.
3. Click on the dropdown and select Show Related Fields.
4. Again, open the dropdown and select the Discovered Application > Discovered Application fields.
5. Now again, open the dropdown and select the Description.`
    },
    {
      title: 'Invalid Redirect URL error message while authorizing Snyk Application',
      description: 'Fix for invalid redirect URL errors during Snyk application authorization.',
      category: 'Troubleshooting',
      content: `The user must ensure that the instance redirect URL (i.e., https://YOUR-INSTANCE.service-now.com/oauth_redirect.do) is provided to the Snyk team through email (servicenow@snyk.io).`
    }
  ]

  // Additional known behaviors from PDF Section 7.3 that are missing
  const missingKnownBehaviorsDocs = [
    {
      title: 'The Snyk application vulnerable item is in the open state even if the Snyk issue is fixed in the Snyk platform',
      description: 'Behavior when CVEs are added to existing issues causing duplicate AVITs.',
      category: 'Known Behaviors',
      content: `If the first ingestion of the Snyk issue does not contain CVEs, but the second ingestion of the same Snyk issue does, two AVITs are made for that issue:
- AVIT that refers to the third-party vulnerability
- AVIT that refers to the particular CVE

If the Snyk issue is fixed on the Snyk side, only the AVIT that refers to the CVE will be closed, while the other AVIT will remain open.

**To close AVIT manually:**
1. Navigate to the Application Vulnerable Item "Application Vulnerability Response." Under it, click "Vulnerable Items" and then select "All."
2. Filter as "Source" "is" "Snyk," and then click on "Run" to view all the issues that are fetched from the Snyk.
3. Click the AVIT record that you want to close manually.
4. Click on the "Close" UI action.`
    },
    {
      title: 'Additional comments and state updates on the Snyk side may take up to ~9 hours in the US region',
      description: 'Expected delays for state updates and comments to sync between ServiceNow and Snyk.',
      category: 'Known Behaviors',
      content: `When a user marks an AVIT as "Mark as False positive" or "Request Exception," then the "Additional comment" added by the user and the state of the issue will be updated to the Snyk platform after 9 hours.

While changing the state of vulnerability from ServiceNow to Snyk, wait at least 9 hours to compare the state on Snyk with ServiceNow.`
    },
    {
      title: 'Users must be added to the approver group for performing "Mark as False positive" and "Request Exception"',
      description: 'Required group memberships for approval workflows in ServiceNow VR.',
      category: 'Known Behaviors',
      content: `When the user marks an AVIT as "Mark as False Positive" or "Request Exception," the AVIT state will be set to "In Review," and the request must be approved.

**Required Groups:**
- For users to approve the request of "Mark as False Positive," they must be in the "False Positive Approver" group.
- Users must be in the Application Exception Approver-Level 1 group to approve the request of "Request Exception."
- If users are not added to the group, the Request will be automatically rejected, as per ServiceNow VR default behavior.

To avoid this case, ensure users are added to the approver group for performing "Mark as False positive" and "Request Exception."`
    },
    {
      title: 'Users must initiate the Reapply calculator\'s UI action inside the VR scope',
      description: 'Requirement to use VR scope when modifying Snyk calculators.',
      category: 'Known Behaviors',
      content: `If the user wants to change or reapply the Snyk calculator, ensure this is done in the Vulnerability Response scope.`
    },
    {
      title: 'Use of "Move Project" V1 Snyk API can lead to unexpected results in SN Integration',
      description: 'Warning about using Snyk V1 Move Projects API and recommended alternatives.',
      category: 'Known Behaviors',
      content: `Using the Snyk V1 "Move Projects" API to move a project will result in unexpected results, including the likelihood that the AVITs associated with the project will become orphaned in ServiceNow. The recommended process is to delete the target in Snyk and re-import the project into the new Org.`
    },
    {
      title: 'OAuth Process - Multi-Group and Multi-Org Limitations',
      description: 'Limitations with OAuth authorization across multiple groups and organizations.',
      category: 'Known Behaviors',
      content: `Snyk now allows customers to have a "Tenant" with multiple Groups. Customers may only select orgs from a single group during the OAuth process. A single integration will not import data across multiple groups due to the permission boundaries of the OAuth tokens.

The OAuth token process can only grant authorization to a SINGLE Org or all Orgs. Selecting multiple Orgs is currently unavailable and will be included in a future release.`
    }
  ]

  // Create all missing documents
  const allMissingDocs = [...missingTroubleshootingDocs, ...missingKnownBehaviorsDocs]
  
  for (const doc of allMissingDocs) {
    // Check if document already exists
    const existing = await prisma.document.findFirst({
      where: { title: doc.title }
    })

    if (!existing) {
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
      console.log(`Created: ${doc.title}`)
    } else {
      console.log(`Skipped (already exists): ${doc.title}`)
    }
  }

  console.log(`\nProcessed ${allMissingDocs.length} additional documents from PDF Section 7`)
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
