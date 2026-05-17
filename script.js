const labs = {
  spoofing: {
    title: "DNS Spoofing Lab",
    difficulty: "easy / network",
    description:
      "Investigate a simulated DNS spoofing incident where a client receives a forged answer before the trusted resolver response.",
    scenario:
      "A workstation requests bank.hil.local. The packet capture shows two DNS answers for the same transaction ID: one trusted response and one suspicious fast response.",
    objective:
      "Find the suspicious responder, explain why the answer is untrusted, and use the evidence inside the HackInLayers room answer box.",
    solution:
      "Collect the baseline, inspect the forged response, compare TTL/source values, then verify the trusted answer after filtering the suspicious responder.",
    command:
      "open pcap dns-spoofing.pcap\nfilter dns.qry.name == bank.hil.local\ncompare answers --txid 0x41af",
    topology: {
      client: "10.10.20.15",
      resolver: "10.10.10.53",
      attacker: "10.10.66.6"
    },
    actions: [
      {
        label: "1. Collect Baseline",
        output:
          "[baseline]\nclient=10.10.20.15\nresolver=10.10.10.53\nquery=bank.hil.local A\nexpected_ttl=300\nstatus=normal path documented"
      },
      {
        label: "2. Inspect Attack Trace",
        output:
          "[attack-trace]\ntxid=0x41af\nfirst_reply_src=10.10.66.6\nfirst_reply_answer=10.66.66.6\nfirst_reply_ttl=1\nsignal=forged answer arrived before trusted resolver"
      },
      {
        label: "3. Extract Evidence",
        output:
          "[evidence]\ntrusted_answer=10.10.10.53 -> 172.16.40.15 ttl=300\nsuspicious_answer=10.10.66.6 -> 10.66.66.6 ttl=1\nfinding=suspicious responder 10.10.66.6"
      },
      {
        label: "4. Verify Defense",
        output:
          "[verify]\nblocked_responder=10.10.66.6\nretry_answer=172.16.40.15\nverdict=trusted DNS resolution restored\n[flag] HIL{spoofed_resolver_spotted}"
      }
    ],
    finding: "Suspicious responder: 10.10.66.6 with TTL=1 and forged answer 10.66.66.6."
  },
  monitoring: {
    title: "DNS Traffic Monitoring Lab",
    difficulty: "easy / soc",
    description:
      "Use DNS monitoring data to identify a suspicious TXT beacon hidden inside normal resolver traffic.",
    scenario:
      "The SOC dashboard contains one minute of DNS logs. Most queries are normal, but repeated TXT lookups indicate suspicious data movement.",
    objective:
      "Find the repeated high-signal DNS query and submit the evidence through the HackInLayers platform.",
    solution:
      "Load the DNS logs, filter TXT records, sort by repeat count and length, then identify the suspicious domain family.",
    command:
      "load dns.log --window 60s\nfilter type == TXT\nsort repeat_count desc, length desc",
    topology: {
      client: "10.10.22.41",
      resolver: "10.10.10.53",
      attacker: "audit-hil.test"
    },
    actions: [
      {
        label: "1. Load DNS Logs",
        output:
          "[logs]\nwindow=60s\ntotal_queries=284\nA_records=193\nAAAA_records=48\nTXT_records=43\nstatus=dataset loaded"
      },
      {
        label: "2. Hunt TXT Beacon",
        output:
          "[hunt]\nquery=update.hil.local type=A count=18\nquery=cdn.hil.local type=AAAA count=9\nquery=7f3a9c2.payload.audit-hil.test type=TXT count=17 length=31"
      },
      {
        label: "3. Review Alert",
        output:
          "[alert]\nrule=dns_txt_repeated_payload\nindicator=7f3a9c2.payload.audit-hil.test\nreason=repeated TXT query with encoded-looking subdomain"
      },
      {
        label: "4. Confirm Finding",
        output:
          "[confirm]\nmatched_family=audit-hil.test\nseverity=medium\nverdict=suspicious TXT beacon confirmed\n[flag] HIL{dns_logs_tell_the_story}"
      }
    ],
    finding: "Suspicious TXT indicator: 7f3a9c2.payload.audit-hil.test."
  },
  flood: {
    title: "DNS Flood Lab",
    difficulty: "medium / defense",
    description:
      "Analyze a simulated DNS flood and recover resolver stability with defensive rate limiting.",
    scenario:
      "The resolver baseline is around 100 QPS. A sudden NXDOMAIN burst increases latency for normal users.",
    objective:
      "Identify the flood metric spike, apply a simulated defensive control, and verify service recovery.",
    solution:
      "Check resolver metrics, identify abnormal QPS and NXDOMAIN ratio, apply NXDOMAIN rate limiting, then verify latency recovery.",
    command:
      "resolver-stats --last 5m\ninspect rcode NXDOMAIN\napply defensive-rate-limit --rcode NXDOMAIN",
    topology: {
      client: "10.10.30.9",
      resolver: "10.10.10.53",
      attacker: "burst sources"
    },
    actions: [
      {
        label: "1. Check Baseline",
        output:
          "[baseline]\nbaseline_qps=104\nnormal_latency=24ms\nnormal_nxdomain_ratio=4%\nstatus=healthy before event"
      },
      {
        label: "2. Observe Flood",
        output:
          "[attack-trace]\ncurrent_qps=1890\nnxdomain_ratio=91%\nlatency=940ms\nsignal=random-subdomain NXDOMAIN burst detected"
      },
      {
        label: "3. Apply Defense",
        output:
          "[defense]\ncontrol=response rate limiting\nscope=NXDOMAIN bursts\nlimit=250 qps\nmode=simulated containment"
      },
      {
        label: "4. Verify Recovery",
        output:
          "[verify]\ncurrent_qps=132\nnxdomain_ratio=8%\nlatency=31ms\nverdict=resolver stability restored\n[flag] HIL{flood_filtered_qps_restored}"
      }
    ],
    finding: "Flood evidence: 1890 QPS with 91% NXDOMAIN ratio before rate limiting."
  },
  poisoning: {
    title: "Cache Poisoning Lab",
    difficulty: "medium / resolver",
    description:
      "Investigate a poisoned resolver cache entry and verify that trusted authority is restored after cache cleanup.",
    scenario:
      "Users sometimes resolve internal.hil.local to the wrong host. The cache dump includes an unexpected authority record.",
    objective:
      "Identify the poisoned authority, flush the affected cache entry, and verify the trusted resolver path.",
    solution:
      "Dump the resolver cache, locate the unexpected NS/A records, flush the affected entry, then verify the trusted authority.",
    command:
      "cache-dump internal.hil.local\ninspect authority records\nflush-cache internal.hil.local\nresolve --verify internal.hil.local",
    topology: {
      client: "10.10.44.18",
      resolver: "10.10.10.53",
      attacker: "ns.attacker.test"
    },
    actions: [
      {
        label: "1. Dump Cache",
        output:
          "[cache]\nname=internal.hil.local\ncached_ns=ns.attacker.test\ncached_a=10.99.99.99\nttl=86400\nstatus=unexpected authority found"
      },
      {
        label: "2. Inspect Poisoning",
        output:
          "[attack-trace]\npoisoned_authority=ns.attacker.test\npoisoned_answer=10.99.99.99\nexpected_authority=ns1.hil.local\nsignal=authority mismatch"
      },
      {
        label: "3. Flush Entry",
        output:
          "[defense]\naction=flush-cache\nscope=internal.hil.local\nresult=poisoned NS and A records removed"
      },
      {
        label: "4. Verify Authority",
        output:
          "[verify]\nauthority=ns1.hil.local\nanswer=172.16.8.20\ntrust=restored\n[flag] HIL{cache_clean_authority_restored}"
      }
    ],
    finding: "Poisoned authority: ns.attacker.test redirected internal.hil.local to 10.99.99.99."
  }
};

const tabs = document.querySelectorAll(".lab-tab");
const labTitle = document.querySelector("#labTitle");
const labDifficulty = document.querySelector("#labDifficulty");
const labStatus = document.querySelector("#labStatus");
const labDescription = document.querySelector("#labDescription");
const labScenario = document.querySelector("#labScenario");
const labObjective = document.querySelector("#labObjective");
const labSolution = document.querySelector("#labSolution");
const labCommand = document.querySelector("#labCommand");
const labOutput = document.querySelector("#labOutput");
const labFinding = document.querySelector("#labFinding");
const runLab = document.querySelector("#runLab");
const copyCommand = document.querySelector("#copyCommand");
const scoreItems = document.querySelector("#scoreItems");
const actionList = document.querySelector("#actionList");
const topologyClient = document.querySelector("#topologyClient");
const topologyResolver = document.querySelector("#topologyResolver");
const topologyAttacker = document.querySelector("#topologyAttacker");

let activeLab = "spoofing";
let completedSteps = new Set();

function typeOutput(text) {
  const lines = text.split("\n");
  labOutput.textContent = "";

  lines.forEach((line, index) => {
    window.setTimeout(() => {
      labOutput.textContent += `${line}\n`;
    }, index * 90);
  });
}

function updateStatus() {
  const lab = labs[activeLab];
  const complete = completedSteps.size === lab.actions.length;
  labStatus.textContent = complete ? "evidence ready" : `${completedSteps.size}/${lab.actions.length} steps`;
  labStatus.classList.toggle("solved", complete);
  labFinding.textContent = complete ? lab.finding : "Run all lab actions to collect the final evidence.";
}

function renderActions(lab) {
  actionList.innerHTML = lab.actions
    .map(
      (action, index) => `
        <button class="action-button" type="button" data-step="${index}">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <strong>${action.label.replace(/^\d+\.\s*/, "")}</strong>
        </button>
      `
    )
    .join("");

  actionList.querySelectorAll(".action-button").forEach((button) => {
    button.addEventListener("click", () => {
      const step = Number(button.dataset.step);
      completedSteps.add(step);
      button.classList.add("complete");
      typeOutput(lab.actions[step].output);
      updateStatus();
    });
  });
}

function renderLab(id) {
  const lab = labs[id];
  activeLab = id;
  completedSteps = new Set();

  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.lab === id);
  });

  labTitle.textContent = lab.title;
  labDifficulty.textContent = lab.difficulty;
  labDescription.textContent = lab.description;
  labScenario.textContent = lab.scenario;
  labObjective.textContent = lab.objective;
  labSolution.textContent = lab.solution;
  labCommand.textContent = lab.command;
  labOutput.textContent = "Choose a lab action or run the full trace to display evidence here.";
  labFinding.textContent = "Run a lab action to collect evidence.";
  topologyClient.textContent = lab.topology.client;
  topologyResolver.textContent = lab.topology.resolver;
  topologyAttacker.textContent = lab.topology.attacker;

  renderActions(lab);
  updateStatus();
}

function renderScoreboard() {
  scoreItems.innerHTML = Object.entries(labs)
    .map(
      ([id, lab]) => `
        <article class="score-card">
          <strong>${lab.title.replace(" Lab", "")}</strong>
          <span>${lab.difficulty}</span>
        </article>
      `
    )
    .join("");
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => renderLab(tab.dataset.lab));
});

runLab.addEventListener("click", () => {
  const lab = labs[activeLab];
  completedSteps = new Set(lab.actions.map((_, index) => index));
  actionList.querySelectorAll(".action-button").forEach((button) => button.classList.add("complete"));
  typeOutput(lab.actions.map((action) => action.output).join("\n\n"));
  updateStatus();
});

copyCommand.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(labs[activeLab].command);
    copyCommand.textContent = "Copied";
    window.setTimeout(() => {
      copyCommand.textContent = "Copy";
    }, 1200);
  } catch {
    copyCommand.textContent = "Select text";
  }
});

renderLab(activeLab);
renderScoreboard();
