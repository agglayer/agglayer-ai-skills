#!/usr/bin/env python3
"""Tests for blast_radius.py."""

from __future__ import annotations

import pytest

from unittest.mock import patch

from blast_radius import is_prose_or_docs, split_nonempty_lines, crate_name, parse_analysis, match_pattern, load_config, DEFAULT_CONFIG


class TestIsProseOrDocs:
    def test_docs_directory(self):
        assert is_prose_or_docs("docs/architecture.md") is True

    def test_docs_subdirectory(self):
        assert is_prose_or_docs("docs/knowledge-base/src/SUMMARY.md") is True

    def test_markdown_file(self):
        assert is_prose_or_docs("README.md") is True

    def test_adoc_file(self):
        assert is_prose_or_docs("notes.adoc") is True

    def test_rst_file(self):
        assert is_prose_or_docs("changelog.rst") is True

    def test_txt_file(self):
        assert is_prose_or_docs("notes.txt") is True

    def test_contributing(self):
        assert is_prose_or_docs("CONTRIBUTING.md") is True

    def test_license(self):
        assert is_prose_or_docs("LICENSE") is True

    def test_changelog(self):
        assert is_prose_or_docs("CHANGELOG.md") is True

    def test_agents_md(self):
        assert is_prose_or_docs("AGENTS.md") is True

    def test_rust_source(self):
        assert is_prose_or_docs("crates/foo/src/lib.rs") is False

    def test_cargo_toml(self):
        assert is_prose_or_docs("Cargo.toml") is False

    def test_proto_file(self):
        assert is_prose_or_docs("proto/types.proto") is False


class TestSplitNonemptyLines:
    def test_empty_string(self):
        assert split_nonempty_lines("") == []

    def test_single_line(self):
        assert split_nonempty_lines("foo") == ["foo"]

    def test_multiple_lines(self):
        assert split_nonempty_lines("a\nb\nc") == ["a", "b", "c"]

    def test_blank_lines_filtered(self):
        assert split_nonempty_lines("a\n\nb\n") == ["a", "b"]


class TestCrateName:
    def test_crate_path(self):
        assert crate_name("crates/agglayer-types/src/lib.rs") == "agglayer-types"

    def test_crate_root_file(self):
        assert crate_name("crates/foo/Cargo.toml") == "foo"

    def test_not_in_crates(self):
        assert crate_name("proto/types.proto") is None

    def test_root_file(self):
        assert crate_name("Cargo.toml") is None

    def test_crates_dir_only(self):
        # "crates/".split("/", 2) == ["crates", ""] -> returns "" not None
        assert crate_name("crates/") == ""


class TestParseAnalysisOutputShape:
    """Verify the output dict has all expected keys."""

    def test_empty_input(self):
        result = parse_analysis([], "none")
        assert result["analysis_source"] == "none"
        assert result["changed_files"] == []
        assert result["changed_file_count"] == 0
        assert result["docs_only"] is False
        assert result["broad_impact"] is False
        assert "affected_crates" in result
        assert "risk_flags" in result
        assert "recommended_scopes" in result
        assert "recommended_commands" in result

    def test_docs_only(self):
        result = parse_analysis(["docs/foo.md", "README.md"], "working-tree")
        assert result["docs_only"] is True
        assert "minimal" in result["recommended_scopes"]

    def test_crate_change(self):
        result = parse_analysis(
            ["crates/agglayer-types/src/lib.rs"], "main...HEAD"
        )
        assert result["docs_only"] is False
        assert "agglayer-types" in result["affected_crates"]
        assert "code" in result["recommended_scopes"]


class TestMatchPattern:
    def test_exact_match(self):
        assert match_pattern("buf.yaml", "buf.yaml") is True

    def test_prefix_match_directory(self):
        assert match_pattern("proto/types.proto", "proto/") is True

    def test_prefix_no_match(self):
        assert match_pattern("src/proto/types.proto", "proto/") is False

    def test_glob_suffix(self):
        assert match_pattern(
            "crates/pessimistic-proof/src/lib.rs", "crates/pessimistic-proof"
        ) is True

    def test_glob_suffix_related_crate(self):
        assert match_pattern(
            "crates/pessimistic-proof-test-suite/tests/foo.rs",
            "crates/pessimistic-proof",
        ) is True

    def test_no_match(self):
        assert match_pattern("crates/agglayer-types/lib.rs", "proto/") is False

    def test_empty_pattern(self):
        assert match_pattern("anything", "") is True

    def test_empty_path(self):
        assert match_pattern("", "proto/") is False


class TestLoadConfig:
    def test_returns_default_when_no_file(self, tmp_path):
        with patch("blast_radius.run_git", return_value=str(tmp_path)):
            config = load_config()
        assert config == DEFAULT_CONFIG

    def test_loads_yaml_config(self, tmp_path):
        config_content = (
            "core_crates:\n"
            "  - my-crate\n"
            "risk_areas: []\n"
            "docs_commands: []\n"
            "code_commands: []\n"
        )
        (tmp_path / ".blast-radius.yaml").write_text(config_content)
        with patch("blast_radius.run_git", return_value=str(tmp_path)):
            config = load_config()
        assert config["core_crates"] == ["my-crate"]
        assert config["risk_areas"] == []

    def test_missing_keys_get_defaults(self, tmp_path):
        config_content = "core_crates:\n  - foo\n"
        (tmp_path / ".blast-radius.yaml").write_text(config_content)
        with patch("blast_radius.run_git", return_value=str(tmp_path)):
            config = load_config()
        assert config["core_crates"] == ["foo"]
        assert config["risk_areas"] == []
        assert config["docs_commands"] == []
        assert config["code_commands"] == []

    def test_empty_yaml_returns_defaults(self, tmp_path):
        (tmp_path / ".blast-radius.yaml").write_text("")
        with patch("blast_radius.run_git", return_value=str(tmp_path)):
            config = load_config()
        assert config == DEFAULT_CONFIG
