# NCA — Salesforce DX

## Pod Structure (LWC + Pod Members)

This project includes:

- **Custom object `Pod_Member__c`** (label **Pod Members**) with:
  - **Title** — standard **Name** (text), shown in the blue/orange role box
  - **Row Type** (`Row_Type__c`) — `Primary` (blue row) or `Secondary` (orange row)
  - **Sort Order** (`Sort_Order__c`) — order within that row
  - **Icon Style** (`Icon_Style__c`) — `Male` or `Female` silhouette when no image URL is set
  - **Image URL** (`Image_URL__c`) — optional; when set, the component shows this image instead of the silhouette
- **Apex** `PodMemberController.getPodMembers()` — ordered query for the LWC
- **LWC** `c/podStructure` — diagram matching the pod layout; add the component to a **Lightning app/home** page
- **LWC** `c/podMemberListEditor` — editable list for **Pod Member** records (inline save, **New** modal, row **Delete**)

Deploy (with default org set):

```bash
sf project deploy start --source-dir force-app/main/default
```

**Permission set:** `Pod_Member_Full_Access` (**Pod Member Full Access**) grants full object access to **Pod Member** (`Pod_Member__c`), tab visibility, `PodMemberController` Apex, and explicit FLS on optional fields (`Icon_Style__c`, `Image_URL__c`). The Metadata API returns *You cannot deploy to a required field* for some standard/required fields (e.g. **Owner**, **Row Type**, **Sort Order**) when included as `fieldPermissions`; object CRUD still applies, and effective FLS for those fields merges with the user’s profile. Assign with:

```bash
sf org assign permset -n Pod_Member_Full_Access -b your.username@company.com -o your-org-alias
```

Add the **Pod Members** tab to your app (App Manager → your app → Navigation Items), create records, then add **Pod Structure** to a Lightning page. New and updated rows appear after a full page load; use the component’s **Refresh** button to reload without leaving the page.

Optional sample data (matches the reference diagram):

```bash
sf apex run --file scripts/apex/seedPodMembers.apex
```

---

# Salesforce DX Project: Next Steps

Now that you’ve created a Salesforce DX project, what’s next? Here are some documentation resources to get you started.

## How Do You Plan to Deploy Your Changes?

Do you want to deploy a set of changes, or create a self-contained application? Choose a [development model](https://developer.salesforce.com/tools/vscode/en/user-guide/development-models).

## Configure Your Salesforce DX Project

The `sfdx-project.json` file contains useful configuration information for your project. See [Salesforce DX Project Configuration](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_ws_config.htm) in the _Salesforce DX Developer Guide_ for details about this file.

## Read All About It

- [Salesforce Extensions Documentation](https://developer.salesforce.com/tools/vscode/)
- [Salesforce CLI Setup Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm)
- [Salesforce DX Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_intro.htm)
- [Salesforce CLI Command Reference](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference.htm)
