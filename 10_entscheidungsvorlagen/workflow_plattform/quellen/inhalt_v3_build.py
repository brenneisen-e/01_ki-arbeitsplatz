# -*- coding: utf-8 -*-
"""Inhalt der Entscheidungsvorlage (Prompt „Improved Prompt for a Rigorous Reassessment“ / Master Prompt vom 16.10.2026).

Schreibt inhalt_v3.json, das deck_build_v3.py und doc_build_v3.py lesen. Ausgabe auf Englisch.
Quellen Q1 bis Q43 aus der Recherche vom 16.10.2026 (Primärquellen bevorzugt, Herstellerangaben gekennzeichnet).
"""
import json, os

HIER = os.path.dirname(os.path.abspath(__file__))
P, M = '+', '-'

D = {}
D['titel'] = 'Workflow-platform strategy: enhance Camunda and MuleSoft, migrate to ServiceNow, or stage the transition'
D['untertitel'] = 'Evidence-based assessment from first principles – ratings, target architecture, decision gates and open questions'
D['datum'] = '16 October 2026'
D['option_kurz'] = {'o1': 'Enhance Camunda/MuleSoft', 'o2': 'Migrate to ServiceNow'}
D['gegenstand'] = [
    ['Option 1', 'Continue and selectively enhance the productive workflow solution based on Camunda (process engine) and MuleSoft (integration layer)'],
    ['Option 2', 'Replace it by ServiceNow, the group\'s strategic platform, migrating selectively and in stages'],
    ['Also assessed', 'A staged target state with clearly bounded coexistence and objective decision gates'],
]
D['kernaussage'] = ('Do not migrate wholesale and do not renew the Camunda base yet: make ServiceNow the default for new case-centric '
                    'and group-aligned workflows, keep Camunda and MuleSoft for system-centric core-banking orchestration, and decide '
                    'on the existing estate at dated gates – the Camunda lifecycle step and the MuleSoft renewal – on a like-for-like '
                    'total cost of ownership.')

D['summary'] = {
    'problem': [
        'Decision: which platform carries the bank\'s workflows over the next five to seven years – the productive Camunda/MuleSoft '
        'solution, the group platform ServiceNow, or a bounded combination.',
        'Why now: Camunda 7 Community Edition receives no further patches, Enterprise maintenance ends in April 2030 and Camunda 8 is '
        'not a drop-in replacement; Mule 4.6 left standard support in August 2026 (Q10, Q11, Q13, Q20).',
        'Cost of delay: every workflow built on an undecided platform adds to later migration volume, and lifecycle spend is made '
        'piecemeal without a target state.',
    ],
    'optionen': [
        'Option 1: keep the productive solution, close its lifecycle gaps and extend it selectively.',
        'Option 2: move all workflows in stages to ServiceNow; integrations rebuilt on Integration Hub or kept on MuleSoft.',
        'Staged coexistence: allocate workflows by process archetype and decide the existing estate at dated gates.',
    ],
    'bewertung': [
        'Wholesale migration is not justified now: no tool converts BPMN logic, Java workers or running instances to ServiceNow; generative build tools only give a head start (No. 1, 6).',
        'ServiceNow\'s edge is archetype-specific: strong for case work with tasks, SLAs and customer contact, unproven for long-running system orchestration with compensation (No. 4, 5).',
        'Run cost hinges on MuleSoft: spokes are licensed per transaction and none covers MuleSoft or German core banking; if MuleSoft stays, ServiceNow adds cost (No. 2, 3).',
        'Option 1 is no standstill: it needs a Camunda version path and Mule upgrades and carries dependency comparable to ServiceNow lock-in (No. 1, 10).',
        'Regulation is neutral: an intra-group ServiceNow service carries the same DORA duties, and none of the vendors is a designated critical provider (No. 9).',
    ],
    'antwort': [
        'Conditions: the group confirms instance model, terms and AI enablement; the Camunda path is costed; a ServiceNow pilot meets pre-agreed criteria.',
        'Caveats: two platforms cost more to run and need strict allocation rules; run cost stays open until the TCO model is filled.',
        'Other options: full Option 2 if the group mandate is binding and funded; Option 1 alone if the group instance cannot hold the bank\'s data.',
    ],
    'quellen': ['Q10', 'Q11', 'Q13', 'Q20'],
}
D['beschluss'] = [
    'Confirm staged coexistence as the working target state; no wholesale migration and no major Camunda renewal before Gate 2.',
    'Approve ServiceNow as default for new case-centric and group-aligned workflows, subject to Gate 1.',
    'Release Phase 1 (fact base, TCO model, two pilots) with budget and named owners.',
]

D['ausgangslage'] = {
    'entscheidung': 'The board must decide which platform carries the bank\'s workflows in the medium term, and on which evidence the '
                    'existing estate is retained or migrated.',
    'warum_jetzt': [
        'Camunda lifecycle: Community Edition 7.24 was the last release, without further security patches; Enterprise maintenance '
        'ends in April 2030, paid extended support runs to April 2032 (Q10, Q11).',
        'No drop-in path: Camunda 8 requires BPMN changes, code refactoring and possibly re-architecture, so keeping Option 1 also '
        'means a migration project (Q13).',
        'Integration lifecycle: Mule 4.6 LTS left standard support in August 2026; current LTS versions run on Java 17 only (Q20).',
        'Group strategy and regulation: ServiceNow is positioned group-wide; DORA register, exit and concentration duties apply to '
        'both options (Q1, Q2).',
    ],
    'folgen_verzoegerung': [
        'Each new workflow on an undecided platform increases later migration volume.',
        'Lifecycle spend on Camunda and Mule is committed without a target state.',
        'Group synergies remain unused and the deviation from group strategy stays unjustified.',
    ],
    'fakten_auftrag': [
        'Bank: multichannel and multibrand, approx. 2,000 employees.',
        'Productive solution: in-house workflow solution based on Camunda and MuleSoft.',
        'Group: ServiceNow established in other group entities, in operation, positioned as the strategic group-wide platform.',
        'Unknown: Camunda version and edition, MuleSoft contract, process inventory, ServiceNow terms and instance model.',
    ],
    'optionen': [
        ['Option 1 – Enhance Camunda/MuleSoft', 'Keep the productive solution, close lifecycle gaps (Camunda version path, Mule upgrades) and extend it selectively.'],
        ['Option 2 – Migrate to ServiceNow', 'Move all workflows in stages to the group platform; integrations rebuilt on Integration Hub or kept on MuleSoft.'],
        ['Staged coexistence', 'Allocate workflows by process archetype, use ServiceNow for new case-centric demand and decide the existing estate at dated gates.'],
    ],
    'quellen': ['Q1', 'Q2', 'Q10', 'Q11', 'Q13', 'Q20'],
}

D['faktenbasis'] = {
    'fakten': [
        'Camunda: Community Edition without patches after 7.24; Enterprise maintenance to April 2030; Camunda 8 not drop-in, production licence mandatory (Q10–Q13).',
        'ServiceNow: Integration Hub is a separate subscription; every outbound call counts as a transaction; no spoke for MuleSoft or German core banking (Q24–Q27).',
        'ServiceNow: flow logic offers Try, parallel and wait steps but no compensation construct; no BPMN import or export (Q28, Q41).',
        'Coexistence links exist: certified Camunda spoke for ServiceNow and MuleSoft\'s ServiceNow connector (Q15, Q21).',
        'DORA: intra-group ICT providers are third-party providers with the same duties; none of the three vendors is a designated CTPP (Q1–Q3).',
    ],
    'schluesse': [
        'Option 1 is not a standstill option: a Camunda version path and Mule upgrades are required either way.',
        'Under Option 2, MuleSoft is likely to stay for core-banking links unless a proof of concept shows otherwise; the single-platform benefit then applies to workflow, not integration.',
        'ServiceNow\'s integrated design pays off for case work; for compensation-heavy system orchestration it is unproven.',
        'Regulatory duties are symmetric; the options differ in who operates the controls, not whether controls are needed.',
    ],
    'annahmen': [
        'A1: The productive solution is stable and accepted; controls and audit evidence are established.',
        'A2: The estate mixes system-centric orchestration and case-centric work.',
        'A3: The group mandate allows justified exceptions.',
        'A4: The Camunda/MuleSoft team is small; key-person risk exists.',
        'A5: ServiceNow would be an intra-group service with cost allocation.',
    ],
    'offen': [
        'Camunda version and edition; MuleSoft contract term and licence model.',
        'Process inventory by archetype, volumes and instance run times.',
        'ServiceNow instance model, data residency, terms and AI enablement.',
        'DORA criticality of the workflow platform.',
    ],
    'quellen': ['Q1', 'Q2', 'Q3', 'Q10', 'Q11', 'Q12', 'Q13', 'Q15', 'Q21', 'Q24', 'Q25', 'Q26', 'Q27', 'Q28', 'Q41'],
}

K = [
    dict(nr=1, kriterium='Change-the-Bank cost', verbindlich=True,
         definition='One-off cost over the horizon for remediation, migration, redesign, testing, data transfer, parallel run, decommissioning, training and business change.',
         o1='0', o1_begr='Not free: on Camunda 7 the step to Camunda 8 is a refactoring project and Mule runtimes need Java-17 upgrades; on Camunda 8 only enhancement cost remains. Neutral until the version is known.',
         o2='--', o2_begr='Every workflow must be redesigned and rebuilt, as no tool converts BPMN logic, Java workers or running instances; integration rework, tests, control evidence, training, parallel run and decommissioning add to it.',
         beleg='Camunda 8 "not a drop-in replacement", conversion tools work out of the box only in simple cases (Q13). ServiceNow: no BPMN import; generative tools give a "head start" (Q35, Q36, Q41).',
         bestaetigung='Camunda version and edition; process inventory with complexity classes; costed pilot.',
         quellen=['Q13', 'Q35', 'Q36', 'Q41']),
    dict(nr=2, kriterium='Run-the-Bank cost', verbindlich=True,
         definition='Annual total cost of ownership in steady state: licences, hosting, operations, engineering, upgrades, security, support, incidents, governance and skills.',
         o1='0', o1_begr='Two commercial licences (Camunda enterprise licence mandatory for Camunda 8 in production; MuleSoft by flows and messages) plus own hosting, patching, upgrades and incident handling; total unknown without contract data.',
         o2='0', o2_begr='Subscription, Integration Hub transactions, AI tiers and group allocation replace own hosting and patching; mandatory upgrades, governance and partners remain, and a retained MuleSoft is added rather than replaced.',
         beleg='Camunda licence (Q12); MuleSoft pricing model (Q19); Integration Hub subscription and transactions (Q24, Q26); new AI tiers (Q43, secondary). No public list prices for any of the three.',
         bestaetigung='Contracts and FTE data for Option 1; group offer incl. Integration Hub and AI tiers; MuleSoft retained/retired scenario.',
         quellen=['Q12', 'Q19', 'Q24', 'Q26', 'Q43']),
    dict(nr=3, kriterium='Complexity of interfaces to other systems', verbindlich=True,
         definition='Effort, standardisation, dependencies and maintainability of links to core banking, documents, channels and group systems in the target state.',
         o1='+', o1_begr='The productive MuleSoft layer already encapsulates core-banking, document and channel links as reusable APIs; the semantic and legacy complexity behind them persists in either option.',
         o2='0', o2_begr='Spokes cut effort for group and SaaS systems, but none exists for MuleSoft, IBM MQ, mainframe or German core banking; those links need custom REST/SOAP/JDBC via MID Server, counted per call, or MuleSoft stays as second layer.',
         beleg='Separate subscription (Q24); spoke list and transaction definition (Q25, Q26); ServiceNow\'s MuleSoft product only imports CMDB metadata (Q27); MuleSoft\'s ServiceNow connector is included (Q21).',
         bestaetigung='Integration inventory by target system; proof of concept with one core-banking interface; transaction volumes.',
         quellen=['Q21', 'Q24', 'Q25', 'Q26', 'Q27']),
    dict(nr=4, kriterium='Complexity within the workflow', verbindlich=True,
         definition='End-to-end complexity of orchestration, data flows, error handling, observability and maintainability for the bank\'s actual process patterns.',
         o1='0', o1_begr='Camunda offers BPMN compensation, error and timer events for long-running system orchestration, but engine, integration layer and task handling are separate tools, so tracing and case UIs need extra effort for human-centric work.',
         o2='0', o2_begr='For case work, flows, tasks, SLAs, data and reporting on one platform reduce hand-offs; for long-running system orchestration there is no compensation construct and interrupted flows cannot be resumed.',
         beleg='Camunda compensation (Q18) and agent monitoring (Q14); ServiceNow flow logic (Q28) and non-resumable interrupted flows (Q29). Assumption A2: mixed estate.',
         bestaetigung='Share of system-centric versus case-centric workflows; pilot comparison of error handling and tracing.',
         quellen=['Q14', 'Q18', 'Q28', 'Q29']),
    dict(nr=5, kriterium='Future readiness', verbindlich=True,
         definition='Scalability, roadmap, innovation speed, maintainability, cyber resilience and the ability to use AI agents and customer-intent processing.',
         o1='0', o1_begr='Camunda 8 adds agentic orchestration (AI agent connector, MCP server, agent monitoring) with the bank\'s own LLM, but only after the Camunda 8 step; security depends on the bank patching a self-managed stack.',
         o2='+', o2_begr='AI agents, orchestration, governance, MCP/A2A and intent-based virtual agents run on the same data and UI, patched by the vendor; benefits depend on higher licence tiers, EU processing of third-party models and channels landing on ServiceNow.',
         beleg='Camunda 8.8–8.10 AI features (Q14); Community Edition without patches (Q11); security notice on bundled Keycloak (Q17). ServiceNow AI Agent Orchestrator GA (Q31), Moveworks (Q32), MCP/A2A tiers (Q33), third-party default models (Q34).',
         bestaetigung='AI tier and approval in the group instance; EU data processing; intent pilot results.',
         quellen=['Q11', 'Q14', 'Q17', 'Q31', 'Q32', 'Q33', 'Q34']),
    dict(nr=6, kriterium='Migration risk and transition complexity', verbindlich=False,
         definition='Risk to stability, customers and ongoing change during the transition, incl. cutover, rollback and adoption (cost: No. 1).',
         o1='+', o1_begr='Change stays within one product family, team and integration layer; Camunda supplies diagram, code and data migration tools and supports drain-out, although its data migration has documented limits.',
         o2='-', o2_begr='Build and discovery tools shorten documentation and build, but redesign, data-model mapping, testing, regulatory evidence and adoption remain; staged drain-out per archetype avoids instance migration and big-bang cutover.',
         beleg='Camunda Data Migrator limits and drain-out (Q13); ServiceNow Build Agent and flow generation from diagrams (Q35, Q36); no ServiceNow conversion tool for BPMN or running instances found.',
         bestaetigung='Instance run times; pilot migration of one workflow by drain-out; adoption plan.',
         quellen=['Q13', 'Q35', 'Q36']),
    dict(nr=7, kriterium='Strategic group alignment and synergy potential', verbindlich=False,
         definition='Fit with group strategy and realisable synergies from shared platform, governance, skills, licences and reuse.',
         o1='-', o1_begr='A local platform needs a documented exception from group strategy; synergies are limited to shared integration and security standards.',
         o2='+', o2_begr='Shared platform team, skills, governance and group applications are reusable; banking extensions (FSO) exist, though without a public German or EU bank reference; synergy requires use of the group instance.',
         beleg='Group positioning (brief); FSO banking applications and data model (Q30, vendor); German sovereign hosting option (Q40). Assumptions A3, A5.',
         bestaetigung='Scope of the mandate; instance model; group cost allocation.',
         quellen=['Q30', 'Q40']),
    dict(nr=8, kriterium='Time to market and adaptability', verbindlich=False,
         definition='Speed and freedom with which new or changed banking workflows can be delivered and adapted.',
         o1='+', o1_begr='Changes are made locally without group release cycles and reuse existing MuleSoft APIs; throughput is limited by the size of the specialist team (A4).',
         o2='0', o2_begr='Low-code and generative build tools can speed up new standard workflows, but mandatory twice-yearly upgrades need regression testing and group governance can slow local change.',
         beleg='ServiceNow Build Agent and Now Assist for Creator (Q35, Q36); N/N-1 upgrade policy without opt-out (Q39).',
         bestaetigung='Lead time for change measured in the pilot; group release and change governance.',
         quellen=['Q35', 'Q36', 'Q39']),
    dict(nr=9, kriterium='Regulation, security and operational stability', verbindlich=False,
         definition='Ability to meet DORA, outsourcing, audit, security and availability requirements in steady state (transition: No. 6).',
         o1='0', o1_begr='The bank operates, patches and secures the stack and owns resilience; MuleSoft brings C5 and a DORA addendum, Camunda ISO 27001/SOC 2 without C5; controls are assumed established (A1), a Community Edition would be a security gap.',
         o2='0', o2_begr='Vendor-run SaaS with ISO, SOC 2, C5 and a financial-services addendum reduces operating effort, but an intra-group service carries the same register, exit and concentration duties, and access, encryption and configuration stay with the bank.',
         beleg='DORA intra-group treatment and exit (Q1, Q2); no CTPP designation (Q3); MuleSoft C5/DORA (Q22); Camunda trust centre (Q16); ServiceNow certifications, addendum, shared responsibility (Q37, Q38, Q42).',
         bestaetigung='DORA criticality and RTO/RPO; group instance contract; Camunda edition and patch level.',
         quellen=['Q1', 'Q2', 'Q3', 'Q16', 'Q22', 'Q37', 'Q38', 'Q42']),
    dict(nr=10, kriterium='Vendor and technology dependency; know-how', verbindlich=False,
         definition='Switching cost, portability, contract leverage and lock-in, and availability of internal and external skills.',
         o1='-', o1_begr='Dependency on two vendors whose terms have shifted (Camunda production licence since 8.6, MuleSoft usage model since 2024) and on a small internal team; BPMN models are portable only in part.',
         o2='-', o2_begr='Logic, data, UI and integration on one proprietary platform without BPMN export and with mandatory upgrades deepen lock-in and complicate a DORA exit plan; group know-how and a large skills market mitigate it.',
         beleg='Camunda licensing (Q12); MuleSoft pricing change (Q19); ServiceNow Fluent API runs only on ServiceNow (Q41), upgrade policy (Q39); BaFin expects lock-in to be assessed for AI (Q6).',
         bestaetigung='Team size and key persons; contractual exit terms; group capacity commitment.',
         quellen=['Q6', 'Q12', 'Q19', 'Q39', 'Q41']),
]
D['kriterien'] = K
D['tabellen_aufteilung'] = [3, 3, 2, 2]
D['vergleich_botschaft'] = ('Option 1 leads on switching cost, existing interfaces, migration risk and time to market, Option 2 on future '
                            'readiness and group alignment; four criteria are level, including run cost, which stays open until the TCO '
                            'model is populated.')

D['uebersicht_lesart'] = [
    'The count is not a weighting.',
    'Option 1\'s leads rest on the existing estate and local control (No. 1, 3, 6, 8), Option 2\'s on new demand and group fit (No. 5, 7) – hence allocation by archetype.',
]

D['kosten'] = {
    'ctb': [
        dict(kategorie='Analysis and design', o1='Target design for the Camunda version path; impact analysis of Mule upgrades.', o2='Process redesign for ServiceNow data model (CSM/FSO tables) and flows; target integration design.'),
        dict(kategorie='Build and conversion', o1='Camunda 7 to 8: diagram conversion and code refactoring, manual beyond simple cases (Q13); enhancements.', o2='Rebuild of all flows, forms, scripts and roles; generative tools speed up simple flows (Q35, Q36).'),
        dict(kategorie='Integration', o1='Mule runtime upgrades to Java-17 LTS; API changes.', o2='Re-point integrations to ServiceNow via MuleSoft, or rebuild on spokes/REST via MID Server.'),
        dict(kategorie='Data and instances', o1='Data Migrator for running instances and history, with limits (Q13).', o2='Drain-out or manual transfer; archive history before shutdown.'),
        dict(kategorie='Testing and evidence', o1='Regression, performance and control evidence for the engine change.', o2='Full functional, end-to-end, performance and control evidence per migrated workflow.'),
        dict(kategorie='Parallel run, decommissioning, training', o1='Short engine switch; limited IT training.', o2='Multi-year coexistence; retire Camunda (and MuleSoft if replaced); train users and process owners.'),
    ],
    'rtb': [
        dict(kategorie='Licences and subscriptions', o1='Camunda enterprise licence (Camunda 8) or Camunda 7 extended support; MuleSoft flows and messages (Q12, Q19).', o2='ServiceNow user and app licences, Integration Hub packs and transactions, AI tier; plus MuleSoft if retained (Q24–Q26).'),
        dict(kategorie='Hosting and resilience', o1='Own clusters, databases, backup and DR; customer owns resilience on Runtime Fabric/hybrid (Q23).', o2='Included in subscription or group allocation; bank keeps MID Servers and its own DR obligations.'),
        dict(kategorie='Operations and upgrades', o1='Platform team; Camunda minor release every six months with 18-month support (Q44); Mule LTS upgrades (Q20).', o2='Local admins and developers; group platform team; twice-yearly mandatory upgrades with regression tests (Q39).'),
        dict(kategorie='Security and incidents', o1='Patch full stack incl. bundled components (Q17); vulnerability response; incident handling.', o2='Vendor patches platform; bank owns access, encryption settings, configuration, custom code (Q38).'),
        dict(kategorie='Support, partners, governance, skills', o1='Vendor support; specialists; DORA register, contracts, exit tests; key-person retention.', o2='Implementation partner; vendor support via group; DORA register, contracts, exit tests; skills from group market.'),
    ],
    'methode': [
        'Same scope (all workflows and their integrations), same horizon (e.g. 2027–2033), same categories; net present value at the bank\'s discount rate.',
        'Option 1 inputs: licence contracts, infrastructure bills, FTE by role, upgrade and incident history, external spend.',
        'Option 2 inputs: group offer by licence type, monthly Integration Hub transactions, AI tier, allocation key, partner rates, upgrade effort.',
        'Unit view: run cost per workflow and per case, to compare archetypes.',
        'Sensitivities: MuleSoft retained or retired; Camunda 7 extended support or Camunda 8; share of migrated workflows.',
    ],
    'treiber': 'Run cost turns on whether MuleSoft can be retired under Option 2: if it stays, ServiceNow is added on top of an unchanged integration licence; if it goes, Integration Hub must carry core-banking links at acceptable transaction cost.',
    'quellen': ['Q12', 'Q13', 'Q17', 'Q19', 'Q20', 'Q23', 'Q24', 'Q25', 'Q26', 'Q35', 'Q36', 'Q38', 'Q39', 'Q44'],
}

D['gesamtbild'] = {
    'o1_staerken': [
        'Productive and accepted (A1); value of models, logic and integrations remains usable.',
        'Purpose-built for long-running system orchestration with compensation (Q18).',
        'MuleSoft APIs are reusable from both platforms (Q15, Q21).',
        'Agentic orchestration available with Camunda 8, model-agnostic (Q14).',
    ],
    'o1_schwaechen': [
        'Lifecycle spend unavoidable: Camunda version path, Mule upgrades (Q10, Q13, Q20).',
        'Full operating and patching burden on a small team (A4).',
        'Case work needs separate task UI, case data and reporting.',
        'Deviation from group strategy.',
    ],
    'o1_risiken': [
        'If Community Edition: no security patches since version 7.24 (Q11).',
        'Key-person risk; vendor terms have shifted before (Q12, Q19).',
        'Drift from group integration and security standards.',
    ],
    'o2_staerken': [
        'Group platform with existing skills, operations and governance.',
        'Workflow, tasks, data, UI and reporting on one platform for case work.',
        'Broad embedded AI with governance and MCP/A2A (Q31, Q33).',
        'Vendor-run SaaS with ISO, SOC 2 and C5 (Q37).',
    ],
    'o2_schwaechen': [
        'No conversion path for BPMN logic, workers or instances (Q41).',
        'No spoke for MuleSoft or German core banking; transactions licensed (Q25).',
        'No compensation construct for system orchestration (Q28).',
        'Subscription, transaction and AI tier costs unknown.',
    ],
    'o2_risiken': [
        'Multi-year coexistence during migration.',
        'Deeper single-vendor lock-in; harder DORA exit (Q1, Q41).',
        'Dependence on group priorities, upgrades and instance model (Q39).',
    ],
    'abwaegung': [
        'Neither option dominates: Option 1 wins where the existing estate creates value, Option 2 where new demand and group alignment matter.',
        'Option 1 leads on more criteria, yet new demand goes to ServiceNow: Option 1\'s leads on cost, interfaces and migration risk (No. 1, 3, 6) arise from the existing estate and do not apply to new workflows, while ServiceNow\'s leads (No. 5, 7) apply in full.',
        'The criterion count is not a weighting; switching cost and migration risk decide the existing estate, group alignment and future readiness decide new demand.',
        'Run cost (No. 2) is the swing criterion and cannot tip the decision until the TCO model is filled.',
        'Two platforms are a cost, not a goal: coexistence is acceptable only with allocation rules and a decommissioning logic.',
    ],
}

D['empfehlung'] = {
    'empfehlung': 'Adopt staged coexistence: ServiceNow becomes the default for new case-centric and group-aligned workflows; Camunda and '
                  'MuleSoft remain the platform for system-centric core-banking orchestration; existing workflows move only at dated gates '
                  'or on major change, each with a positive business case.',
    'begruendung': [
        'It avoids the decisive cost and risk of a wholesale migration (No. 1, 6) while using ServiceNow where its advantages are demonstrable (No. 4 for case work, 5, 7).',
        'It turns forced lifecycle events – Camunda version path, MuleSoft renewal – into decision points, so neither sunk cost nor group pressure decides by default.',
        'It keeps the run-cost question open until data can answer it (No. 2).',
        'It is reversible: drain-out and existing links (Camunda spoke, MuleSoft connector) allow coexistence without big-bang cutover (Q13, Q15, Q21).',
    ],
    'zielbild': 'End state (indicative 2030): ServiceNow carries case-centric, employee-facing and group-aligned workflows, incl. AI-assisted '
                'triage where piloted successfully. A slim Camunda 8 platform carries system-centric core-banking orchestration – or is '
                'retired if Gate 2 shows ServiceNow can do so at equal control and lower cost. MuleSoft serves system APIs to both until Gate 3.',
    'abgrenzung': [
        'In scope: all workflows on the current solution, their integrations and new workflow demand.',
        'Out of scope: core-banking systems, channel front-ends, group instance governance.',
        'Each process instance is orchestrated by exactly one platform.',
    ],
    'annahmen': [
        'A2 mixed estate, A3 exceptions allowed and A5 intra-group service hold.',
        'The group instance can be used for the bank\'s data (to be confirmed at Gate 1).',
    ],
    'bedingungen_o1': [
        'The group allows lasting exceptions and the group instance cannot be used for the bank\'s data (residency, banking secrecy, separation).',
        'The estate is predominantly system-centric, with few case-centric workflows.',
        'The Camunda path costs materially less than migration and the specialist team can be secured.',
    ],
    'bedingungen_o2': [
        'The group mandate is binding without exceptions, or the group funds migration and parallel run.',
        'A pilot with a long-running, system-centric workflow meets the same control, error-handling and throughput criteria as Camunda.',
        'Core-banking links run on Integration Hub, or a retained MuleSoft, at a TCO that favours ServiceNow over the horizon.',
        'The Camunda path at Gate 2 requires a re-architecture of comparable scope anyway.',
    ],
    'bedingungen_gestuft': [
        'An architecture board enforces allocation rules and no workflow is orchestrated on both platforms.',
        'The extra run cost of two platforms stays below the avoided migration cost and risk.',
        'Gates are held on schedule with the agreed KPIs.',
    ],
}
D['bedingungen_botschaft'] = ('The recommendation is robust to most outcomes; three facts would overturn it – a binding and funded group mandate, '
                              'a failed pilot or unusable group instance, or a Camunda path as costly as migration – and each is testable in Phase 1.')

D['zielarchitektur'] = {'ebenen': [
    dict(ebene='Channels', bausteine=[dict(name='Portal and app', art='neutral'), dict(name='Branch and contact centre', art='neutral'),
                                      dict(name='E-mail and documents', art='neutral')]),
    dict(ebene='Intake', bausteine=[dict(name='Customer-intent service', zusatz='AI triage, routes to both platforms; platform decided by pilot', art='gem')]),
    dict(ebene='Workflow', bausteine=[dict(name='ServiceNow', zusatz='case-centric and group-aligned workflows', art='sn'),
                                      dict(name='Camunda 8', zusatz='system-centric core-banking orchestration', art='cam')]),
    dict(ebene='Integration', bausteine=[dict(name='MuleSoft system APIs', zusatz='shared by both platforms; review at Gate 3', art='gem'),
                                         dict(name='Integration Hub', zusatz='group and SaaS systems', art='sn')]),
    dict(ebene='Systems of record', bausteine=[dict(name='Core banking and payments', art='neutral'), dict(name='DMS and archive', art='neutral'),
                                               dict(name='Group systems', art='neutral')]),
]}

D['archetypen'] = [
    dict(name='System-centric core-banking orchestration', farbe='Camunda', plattform='Retain on Camunda',
         merkmale='High volumes, many system calls (core banking, payments, DMS), long-running, compensation on partial failure, few human steps.',
         begruendung='BPMN compensation, error and timer events; productive MuleSoft APIs; ServiceNow advantage not shown for this pattern; transaction cost at volume unknown.',
         ausloeser='Gate 2: migrate if a ServiceNow pilot meets control and throughput criteria and TCO is below the Camunda path.'),
    dict(name='Case-centric processing', farbe='ServiceNow', plattform='Migrate to ServiceNow: new now, existing on change',
         merkmale='Service requests, complaints, approvals, document follow-ups, SLA-driven queues, customer communication.',
         begruendung='Tasks, forms, SLAs, knowledge, case record and reporting on one platform reduce hand-offs; banking data model (FSO) available, fit to be verified.',
         ausloeser='Gate 1 pilot; existing workflows move at their next major change or at Gate 2.'),
    dict(name='Internal and group-aligned workflows', farbe='ServiceNow', plattform='Migrate to ServiceNow group instance',
         merkmale='IT, HR, procurement, risk and compliance, third-party and outsourcing management.',
         begruendung='Group standard already in operation; no banking-specific logic; synergies in skills and governance.',
         ausloeser='None, once instance model and data separation are confirmed at Gate 1.'),
    dict(name='Customer-intent intake and AI triage', farbe='offen', plattform='Review: decided by pilot',
         merkmale='Inbound e-mail, chat, portal and call transcripts; classification and routing.',
         begruendung='Must route into both platforms; ServiceNow AI fits if customer service lands there, an open intent service if core-banking routing dominates.',
         ausloeser='Gate 1 pilot: accuracy, fallback rate, cost per enquiry, AI Act and DORA assessment.'),
    dict(name='System APIs and data access', farbe='MuleSoft', plattform='Retain on MuleSoft as shared layer',
         merkmale='Links to core banking, DMS, channels and group systems.',
         begruendung='Productive and usable from ServiceNow via the MuleSoft connector or REST; replacement only with proven coverage and lower TCO.',
         ausloeser='Gate 3: MuleSoft contract renewal.'),
]

D['uebergang'] = {
    'botschaft': 'Four phases with four gates ensure that each irreversible step is taken only on evidence: group frame first, then pilots, then the lifecycle decision, integration and decommissioning last.',
    'phasen': [
        dict(phase='Fact base and group frame', zeitraum='Months 0–6',
             inhalt='Inventory by archetype; Camunda version and lifecycle path; MuleSoft contract; ServiceNow instance model, terms, AI enablement; DORA criticality; TCO model; pilot set-up. Patch Camunda at once if on Community Edition.',
             tor_name='Gate 1 – confirm target state',
             tor='Group frame and instance model confirmed; TCO model on identical categories; DORA assessment of ServiceNow use; pilot criteria agreed.'),
        dict(phase='ServiceNow for new demand, pilots', zeitraum='Months 6–18',
             inhalt='New case-centric and group workflows on ServiceNow; one existing case workflow migrated by drain-out; intent pilot; Camunda kept secure and supported, no major renewal.',
             tor_name='Gate 2 – lifecycle decision',
             tor='Per remaining workflow: Camunda path or migration, based on pilot KPIs (change lead time, error rate, SLA adherence, cost per case) – before any major Camunda commitment.'),
        dict(phase='Execute lifecycle decision', zeitraum='Months 18–36',
             inhalt='Migrate workflows selected at Gate 2 by drain-out; modernise Camunda for retained system-centric workflows; end-to-end monitoring across platforms.',
             tor_name='Gate 3 – integration layer',
             tor='Before MuleSoft renewal: keep MuleSoft as shared layer or consolidate on Integration Hub, based on coverage proof and TCO.'),
        dict(phase='Consolidate or decommission', zeitraum='From month 36',
             inhalt='Retire Camunda if the residual estate falls below the economic threshold; otherwise run two platforms under fixed rules with annual review.',
             tor_name='Gate 4 – decommissioning',
             tor='No active instances on the platform to retire, history archived, residual run cost per workflow above annualised migration cost.'),
    ],
    'koexistenz': [
        'One instance, one engine: each process instance is orchestrated end to end by one platform; hand-offs only via defined APIs or events.',
        'Allocation by archetype: the architecture board assigns new demand; nothing new on components due for retirement.',
        'One case ID: a correlation ID across channels, platforms and MuleSoft for tracing and audit.',
        'Data ownership: business data stays in systems of record, workflow data in the orchestrating platform.',
        'One security baseline: group IAM, logging and retention rules on both platforms.',
    ],
    'integration': [
        'MuleSoft keeps core-banking, DMS and channel links; ServiceNow consumes them via the MuleSoft ServiceNow connector or REST (Q21).',
        'Integration Hub spokes for group and SaaS systems already used in the group instance; transaction volumes monitored (Q26).',
        'ServiceNow flows can start and correlate Camunda processes via the certified Camunda spoke (Q15).',
        'No point-to-point links from ServiceNow to core banking that bypass MuleSoft.',
        'API catalogue with owners, versions and consumers on both platforms.',
    ],
    'stilllegung': [
        'Drain-out instead of instance migration: new instances start on the target, running ones complete on the old platform (Q13).',
        'Instance migration only for cases that would outlast the coexistence window.',
        'Archive history and audit data, readable for the retention period, before shutdown.',
        'Retire Camunda when no instances remain and residual cost per workflow exceeds annualised migration cost.',
        'Switch off a MuleSoft API only when the catalogue shows no consumer.',
    ],
    'quellen': ['Q13', 'Q15', 'Q21', 'Q26'],
    'rueckfall': [
        'Hypercare per migrated workflow for at least one full business cycle, with thresholds set before go-live.',
        'Trigger: error rate, SLA breaches or backlog above the old baseline, or a critical control finding.',
        'Mechanism: route new instances back to the old platform, which stays deployable with live integrations until hypercare ends.',
        'Running instances need no rollback; they finish where they started.',
        'Joint decision of process owner and platform owner, documented for audit.',
    ],
}

D['umsetzung'] = {
    'botschaft': 'Coexistence only works with firm governance, secured skills on both platforms and a commercial and regulatory frame agreed with the group before Gate 1.',
    'governance': [
        'Architecture board with group IT; allocation rules by archetype.',
        'Gates as board decisions with agreed KPIs.',
        'Documented exception from the group mandate for retained workflows.',
        'Quarterly reporting on cost, stability and migration progress.',
    ],
    'kompetenzen': [
        'Secure the Camunda/MuleSoft core team with deputies – needed in every option during coexistence.',
        'Local ServiceNow product owners and developers, backed by the group platform team and a partner.',
        'AI and data skills for the intent pilot; AI literacy measures (Q7, Q8).',
    ],
    'kommerziell': [
        'Group offer by licence type incl. Integration Hub packs, transactions and AI tier; allocation key.',
        'MuleSoft renewal dates and options; Camunda path pricing.',
        'Exit, data-return, price-protection and audit clauses.',
    ],
    'sicherheit_regulatorik': [
        'DORA register for both platforms incl. intra-group provider and first external subcontractor (Q4).',
        'Criticality, tested exit plans, concentration assessment (Q1, Q2); ICT services outside MaRisk AT 9 (Q5).',
        'Data protection: residency and third-country support access (Q9); AI Act and BaFin AI guidance (Q6, Q7).',
    ],
    'daten_integration': [
        'Inventory and archetype classification of all workflows.',
        'API catalogue and correlation-ID standard.',
        'Archiving concept and data-model mapping to ServiceNow tables.',
    ],
    'verantwortung': [
        'Board: target state and gates. CIO: platform strategy and architecture board.',
        'COO and business: process ownership and pilot acceptance. CFO: TCO model.',
        'CRO and ISO: DORA, security, outsourcing. Group IT: ServiceNow platform and terms.',
    ],
    'quellen': ['Q1', 'Q2', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9'],
    'top5': [
        dict(massnahme='Establish the fact base within 90 days: inventory by archetype, Camunda version and lifecycle, MuleSoft contract and runtime status',
             ergebnis='Verified basis for change cost, migration risk and Gate 2 timing', verantwortlich='CIO'),
        dict(massnahme='Agree the group frame: scope of the ServiceNow mandate, instance model, data residency, terms, AI enablement',
             ergebnis='Binding frame for allocation rules and the run-cost comparison', verantwortlich='CIO with group IT'),
        dict(massnahme='Build the like-for-like TCO model for Option 1, Option 2 and staged coexistence',
             ergebnis='Answer to the swing criterion run cost, incl. MuleSoft retained or retired', verantwortlich='CFO with CIO'),
        dict(massnahme='Run two pilots with pre-agreed acceptance criteria: one case-centric workflow on ServiceNow by drain-out, one customer-intent use case',
             ergebnis='Evidence for Gates 1 and 2 on effort, quality, adoption and cost per case', verantwortlich='COO with platform owners'),
        dict(massnahme='Set up governance and DORA documentation: architecture board, allocation rules, register entries, exit plans, concentration assessment',
             ergebnis='Controlled coexistence and regulatory readiness for both platforms', verantwortlich='CIO and CRO'),
    ],
}

D['offene_fragen'] = [
    dict(prio=1, frage='Is the ServiceNow positioning binding for all workflows, are exceptions allowed, and will the group co-fund migration?',
         bewertungen='No. 1, 7, 10; recommendation', methode='Written confirmation by group IT and group board; group architecture policy'),
    dict(prio=2, frage='Which Camunda version and edition runs today, and what does the lifecycle path cost?',
         bewertungen='No. 1, 2, 5, 6, 9', methode='Licence contracts; Camunda migration analysis of the model estate; vendor quote'),
    dict(prio=3, frage='Can MuleSoft be retired under Option 2 – which links can Integration Hub carry, at what transaction cost?',
         bewertungen='No. 2, 3, 4', methode='Integration inventory; proof of concept with one core-banking interface; group quote'),
    dict(prio=4, frage='What are the ServiceNow terms (licence types, Integration Hub, CSM/FSO, AI tier) and the MuleSoft contract terms?',
         bewertungen='No. 2', methode='Group offer; contract analysis; TCO model'),
    dict(prio=5, frage='How is the estate split across archetypes (volumes, instance run times, human steps)?',
         bewertungen='No. 4, 6, 8; allocation', methode='Inventory from Camunda history data; process mining'),
    dict(prio=6, frage='Does the workflow platform support critical or important functions under DORA, with which RTO/RPO?',
         bewertungen='No. 9', methode='Business impact analysis; DORA register; concentration assessment'),
    dict(prio=7, frage='Can the bank use the group instance (data separation, EU residency, support access, encryption keys)?',
         bewertungen='No. 7, 9', methode='Group architecture review; data protection and outsourcing assessment'),
    dict(prio=8, frage='Which ServiceNow AI capabilities are licensed and approved in the group instance, with EU processing?',
         bewertungen='No. 5', methode='Group AI governance; intent pilot'),
    dict(prio=9, frage='How large and resilient is the Camunda/MuleSoft team, and what ServiceNow capacity can the group commit?',
         bewertungen='No. 8, 10', methode='Skills inventory; capacity commitment of the group platform team'),
]
D['offene_botschaft'] = ('Four answers can change the recommendation – the group mandate, the Camunda lifecycle path, MuleSoft retirement '
                         'and the ServiceNow terms – and all four can be obtained within Phase 1.')

Q = [
    ('EU, Regulation (EU) 2022/2554 (DORA), Art. 3, 5, 28–31', 'https://eur-lex.europa.eu/eli/reg/2022/2554/oj'),
    ('European Commission, Delegated Regulation (EU) 2024/1773, RTS on ICT services supporting critical or important functions', 'https://eur-lex.europa.eu/eli/reg_del/2024/1773/oj'),
    ('ESAs, List of designated critical ICT third-party providers, 18 Nov 2025', 'https://www.eba.europa.eu/sites/default/files/2025-11/e388451b-356b-408a-bbf2-b8e425865d75/List%20of%20designated%20CTPPs.pdf'),
    ('BaFin, Informationsregister und Anzeigepflichten', 'https://www.bafin.de/DE/unternehmen-maerkte/aufsicht/alle-unternehmen/it-cybersicherheit/register-anzeigepflichten/register-anzeigepflichten_node.html'),
    ('BaFin, Rundschreiben 06/2026 (BA) MaRisk, AT 9', 'https://www.bafin.de/SharedDocs/Downloads/DE/Rundschreiben/dl_rs_0626_9_marisk.pdf'),
    ('BaFin, Orientierungshilfe zu IKT-Risiken beim Einsatz von KI, 18 Dec 2025', 'https://www.bafin.de/SharedDocs/Downloads/DE/Anlage/dl_Anlage_orientierungshilfe_IKT_Risiken_bei_KI.pdf'),
    ('EU, Regulation (EU) 2024/1689 (AI Act), Art. 4, Annex III', 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj'),
    ('EU, Regulation (EU) 2026/1744 (Digital Omnibus on AI), high-risk dates', 'https://eur-lex.europa.eu/eli/reg/2026/1744/oj'),
    ('EDPB, Guidelines 05/2021 on Art. 3 and Chapter V GDPR, v2.0', 'https://www.edpb.europa.eu/system/files/2023-02/edpb_guidelines_05-2021_interplay_between_the_application_of_art3-chapter_v_of_the_gdpr_v2_en_0.pdf'),
    ('Camunda, Camunda 7 Enterprise support announcements', 'https://docs.camunda.org/enterprise/announcement/'),
    ('Camunda, Camunda 7 Community Edition end of life announced, 6 Mar 2024', 'https://forum.camunda.io/t/important-update-camunda-7-community-edition-end-of-life-announced/50921'),
    ('Camunda, Camunda licensing: what you need to know, 8 Oct 2024', 'https://camunda.com/blog/2024/10/camunda-licensing-what-you-need-to-know/'),
    ('Camunda, Camunda 7 to Camunda 8 migration guide and tools', 'https://docs.camunda.io/docs/guides/migrating-from-camunda-7/'),
    ('Camunda, What\'s new in 8.10 (agentic orchestration, agent monitoring), 13 Oct 2026', 'https://docs.camunda.io/docs/reference/announcements-release-notes/8100/whats-new-in-810/'),
    ('Camunda, ServiceNow integration (Camunda spoke)', 'https://docs.camunda.io/docs/components/camunda-integrations/servicenow/servicenow-integration/'),
    ('Camunda, Trust Center (ISO 27001, SOC 2 Type II)', 'https://trust.camunda.com/'),
    ('Camunda, Security notices (notice 67, bundled Keycloak), 9 Oct 2026', 'https://docs.camunda.io/docs/reference/notices/'),
    ('Camunda, BPMN compensation handler', 'https://docs.camunda.io/docs/components/modeler/bpmn/compensation-handler/'),
    ('Salesforce, MuleSoft integration and API management pricing', 'https://www.salesforce.com/eu/mulesoft/anypoint-platform/pricing/'),
    ('MuleSoft, Mule runtime Java adoption and LTS support dates', 'https://docs.mulesoft.com/release-notes/mule-runtime/java-adoption'),
    ('MuleSoft, ServiceNow Connector release notes (Select connector)', 'https://docs.mulesoft.com/release-notes/connector/servicenow-connector-release-notes-mule-4'),
    ('Salesforce, DORA update and Financial Services Addendum, 17 Jan 2025', 'https://www.salesforce.com/news/stories/salesforce-dora-update/'),
    ('MuleSoft, High availability and disaster recovery across deployment models', 'https://docs.mulesoft.com/hosting-home/hadr-guide'),
    ('ServiceNow Docs, Integration Hub (separate subscription)', 'https://www.servicenow.com/docs/bundle/zurich-integrate-applications/page/administer/integrationhub/concept/integrationhub.html'),
    ('ServiceNow, Integration Hub and Workflow Data Fabric overview (SKUs, transactions, spokes), 27 Jan 2025', 'https://www.servicenow.com/community/s/cgfwn76974/attachments/cgfwn76974/it-service-management-forum/536559/1/snc-addendum-integrationhub.pdf'),
    ('ServiceNow Docs, Integration Hub usage and subscription', 'https://www.servicenow.com/docs/bundle/zurich-integrate-applications/page/administer/flow-designer/concept/subscription-usage.html'),
    ('ServiceNow Docs, API Service Graph Connector for MuleSoft', 'https://www.servicenow.com/docs/r/servicenow-platform/configuration-management-database-cmdb/api-sgc-mulesoft.html'),
    ('ServiceNow Docs, Flow logic (Zurich)', 'https://www.servicenow.com/docs/bundle/zurich-build-workflows/page/administer/flow-designer/concept/flow-logic.html'),
    ('ServiceNow Support, KB1285750 (presumed interrupted flows)', 'https://support.servicenow.com/kb?id=kb_article_view&sysparm_article=KB1285750'),
    ('ServiceNow Community (ServiceNow employee), Banking service management in FSO, 2 Mar 2026 – vendor statement', 'https://www.servicenow.com/community/fso-articles/getting-started-with-banking-service-management-in-financial/ta-p/3500286'),
    ('ServiceNow Newsroom, Yokohama release: AI Agent Orchestrator GA, 12 Mar 2025', 'https://newsroom.servicenow.com/press-releases/details/2025/ServiceNows-latest-platform-release-adds-to-thousands-of-AI-agents-across-CRM-HR-IT-and-more-for-faster-smarter-workflows-and-maximum-business-impact-03-12-2025-traffic/default.aspx'),
    ('ServiceNow Newsroom, Acquisition of Moveworks completed, 15 Dec 2025', 'https://newsroom.servicenow.com/press-releases/details/2025/ServiceNow-completes-acquisition-of-Moveworks/default.aspx'),
    ('ServiceNow Community (employee), MCP and A2A for agentic workflows, Sep 2026', 'https://www.servicenow.com/community/now-assist-articles/enable-mcp-and-a2a-for-your-agentic-workflows-with-faqs-updated/ta-p/3373907'),
    ('ServiceNow Community (employee), Third-party model providers become default for Now Assist, 2 Jul 2026', 'https://www.servicenow.com/community/now-assist-articles/third-party-model-providers-are-becoming-the-default-for-now/ta-p/3560810'),
    ('ServiceNow Docs, Build Agent, Aug 2026', 'https://www.servicenow.com/docs/r/guL1zqmJkV9eywMq_6qu~w/mIzyr9MvxVJdZ0Ls61W1lw'),
    ('ServiceNow Community (employee), Now Assist for Creator: flow generation from diagrams, 7 May 2025', 'https://www.servicenow.com/community/now-assist-for-creator-articles/what-s-new-in-now-assist-for-creator-yokohama-store-2-may/ta-p/3257716'),
    ('ServiceNow Trust, Certifications (ISO 27001/17/18/701, SOC 1/2, BSI C5)', 'https://trust.servicenow.com/certifications'),
    ('ServiceNow, Shared responsibility model white paper, Aug 2026', 'https://www.servicenow.com/content/dam/servicenow-assets/public/en-us/doc-type/resource-center/white-paper/wp-shared-responsibility-model.pdf'),
    ('ServiceNow Support, KB2177115 (N/N-1 release support, end-of-life upgrades)', 'https://support.servicenow.com/kb?id=kb_article_view&sysparm_article=KB2177115'),
    ('ServiceNow Newsroom, T-Systems live as Sovereign Partner Cloud Provider in Germany, 8 Sep 2026', 'https://newsroom.servicenow.com/de/press-releases/details/2026/T-Systems-Geht-Live-als-Sovereign-Partner-Cloud-Provider-in-Deutschland-/default.aspx'),
    ('ServiceNow Docs, Fluent Flow API (process logic as code, runs only on ServiceNow), Mar 2026', 'https://www.servicenow.com/docs/r/SmYvGPN0OygSQs53fsexIQ/Bjrgy3Xx9BkRCZQExND7IA'),
    ('ServiceNow, Security for financial services white paper (Financial Services Addendum) – vendor statement', 'https://www.servicenow.com/content/dam/servicenow-assets/public/en-us/doc-type/resource-center/white-paper/wp-security-for-financial-services.pdf'),
    ('ServiceNow Community, ITSM licensing April 2026: Foundation, Advanced, Prime – secondary', 'https://www.servicenow.com/community/itsm-articles/itsm-licensing-in-april-2026-foundation-advanced-and-prime-in/ta-p/3544380'),
    ('Camunda, Release policy (minor releases April and October, 18 months support)', 'https://camunda.com/release-policy/'),
]
D['quellen'] = [dict(id='Q%d' % i, text=t, url=u) for i, (t, u) in enumerate(Q, 1)]

D['agenda'] = {
    'kapitel': [
        dict(nr=1, titel='Decision required and evidence base', zweck='Inform', minuten=5, keys=['ausgangslage', 'faktenbasis'],
             botschaft='Lifecycle events force a decision; facts, assumptions and open questions are kept apart'),
        dict(nr=2, titel='Comparison of options', zweck='Discuss', minuten=15, keys=['vergleich', 'gesamtbild'],
             botschaft='Option 1 leads on cost, interfaces and transition; Option 2 on future readiness and group fit'),
        dict(nr=3, titel='Recommendation and target architecture', zweck='Decide', minuten=15, keys=['empfehlung', 'archetypen'],
             botschaft='Staged coexistence, with workflows allocated by process archetype'),
        dict(nr=4, titel='Transition path and conditions', zweck='Discuss', minuten=10, keys=['uebergang', 'bedingungen'],
             botschaft='Four gates; three testable facts would overturn the answer'),
        dict(nr=5, titel='Implementation and open questions', zweck='Decide', minuten=10, keys=['umsetzung', 'offene_fragen'],
             botschaft='Five actions in six months create the evidence for Gate 1'),
    ],
    'anhang': dict(titel='Appendix: list of sources', keys=['quellen', 'quellen_ende']),
    'gesamt': 'Executive summary (slide 2) is taken as read. Proposed 60 minutes: 5 for the summary, 55 for the chapters, about one third presenting and two thirds discussion.',
}

D['action_titles'] = {
    'agenda': 'From the answer to the evidence: recommendation, assessment, target architecture, transition and open questions',
    'management_summary': 'Stage the transition: ServiceNow for new case-centric demand, Camunda/MuleSoft for core orchestration, gated decisions for the rest',
    'ausgangslage': 'Lifecycle events at Camunda and MuleSoft force a platform decision within the next planning cycle',
    'faktenbasis': 'Facts, inferences, assumptions and open questions are kept apart; four open questions can change the answer',
    'vergleich': 'Option 1 leads on cost, interfaces, migration risk and time to market; Option 2 on future readiness and group alignment',
    'vergleich_1': 'Change cost and interfaces favour Option 1 today; run cost stays level until the TCO model is filled',
    'vergleich_2': 'Option 2 leads on future readiness, Option 1 on migration risk; intra-workflow complexity is level',
    'vergleich_3': 'Group alignment favours Option 2, time to market favours Option 1',
    'vergleich_4': 'Regulation and dependency are level once both options are treated symmetrically',
    'bewertungsuebersicht': 'Option 1 leads on four criteria, Option 2 on two; four are level, including the swing criterion run cost',
    'kosten_ctb': 'Change cost favours Option 1: Option 2 rebuilds every workflow, Option 1 pays for the Camunda version step and Mule upgrades',
    'kosten': 'Run cost hinges on whether MuleSoft can be retired; both options must be costed on identical categories',
    'gesamtbild': 'Option 1 wins where the existing estate creates value, Option 2 where new demand and group alignment matter',
    'empfehlung': 'Allocate workflows by archetype within one target architecture, with MuleSoft as the shared integration layer',
    'archetypen': 'Two archetypes stay on Camunda/MuleSoft, two move to ServiceNow, customer intent is decided by pilot',
    'uebergang': 'Four gates ensure that each irreversible step is taken only on evidence',
    'koexistenz': 'Coexistence is bounded by one engine per instance, drain-out migration and pre-defined rollback triggers',
    'bedingungen': 'Three facts would overturn the recommendation; each is testable in Phase 1',
    'umsetzung': 'Coexistence needs firm governance, secured skills on both platforms and an agreed group frame',
    'massnahmen': 'Five actions in the next six months create the evidence for Gate 1',
    'offene_fragen': 'Four of nine questions can change the recommendation and are answerable within Phase 1',
    'quellen': 'Primary sources for product, licensing, security and regulatory claims; vendor statements are marked',
}

json.dump(D, open(os.path.join(HIER, 'inhalt_v3.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('inhalt_v3.json geschrieben,', len(D['quellen']), 'Quellen')
